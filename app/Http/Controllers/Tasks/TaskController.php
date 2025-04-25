<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\StepDetail;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskUser;
use App\Models\TaskWorkFlows;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use PhpParser\Node\Stmt\Foreach_;
use Psy\Readline\Hoa\Console;

class TaskController extends Controller
{
    //
    public function createMainTask(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'department' => 'required|integer',
            'parent_id' => 'nullable|exists:users,id',
            'project_id' => 'required|exists:projects,id',
            'category_id' => 'required'
        ]);
        $user = auth()->user();
        // create main task
        $curStep = TaskWorkFlows::where("category_id", $validated['category_id'])
            ->where("step_order", 1)
            ->first();
        $department = Department::find($curStep->department);
        $department_leader = $department->manager()->first();
        // tạo step flow
        // create account task 
        $newTask = Task::create([
            'parent_id' => null,
            'project_id' => $validated['project_id'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'next_assignee_id' => auth()->id(),
            'status' => 1, // default đang làm
            'category_id' => $validated["category_id"],
            'step_order' => 1,
            'created_by' => auth()->id(),
            'due_date' => $validated['due_date'],
            'department_id' => $validated['department'],
            'qc_status' => null,
            'step_id' => $curStep["current_step_id"],
        ]);
        $nextStep = TaskWorkFlows::where("category_id", $validated['category_id'])
            ->where("step_order", $curStep['step_order'] + 1)
            ->first();
        $nextDepartment = Department::find($nextStep['department']);
        // create leader task
        $newLeaderTask = Task::create([
            'parent_id' => $newTask['id'],
            'project_id' => $newTask['project_id'],
            'name' => $newTask['name'],
            'description' => "",
            'next_assignee_id' => $nextDepartment['manager'],
            'status' => 1, // default 
            'category_id' => $newTask["category_id"],
            'step_order' => 2,
            'created_by' => auth()->id(),
            'due_date' => $newTask['due_date'],
            'department_id' => $newTask['department_id'],
            'qc_status' => null,
            'step_id' => $curStep["next_step_id"],
            'parent_task_id' => $newTask['id'],
        ]);
        $step = $newTask->stepDetail;
        // id task lớn
        $taskStepFlow[] = [
            "step_id" => $curStep["current_step_id"],
            "step_name" =>  $step['name'],
            "status" => 2,
            "next_assignee_name" => $user['name'],
        ];
        $nextStepDetail = $newLeaderTask->stepDetail;

        $taskStepFlow[] = [
            "step_id" => $nextStep["current_step_id"],
            "step_name" =>  $nextStepDetail['name'],
            "status" => 1,
            "next_assignee_name" => $department_leader['name'],
        ];
        $newTask->task_step_flow = json_encode($taskStepFlow);
        $newTask->save();
        $this->addTaskStepFlow($newTask, $newLeaderTask, $nextStep);
        return response()->json(['message' => "create task successfully"], 200);
    }

    public function addTaskStepFlow(Task $parent, Task $children, ?TaskWorkFlows $curStep = null, ?User $assignee = null)
    {
        $taskStepFlow = json_decode($parent['task_step_flow']);
        // find children next step 
        if (!$curStep) {
            $curStep = TaskWorkFlows::where("category_id", $children["category_id"])
                ->where("step_order", $children['step_order'])
                ->first();
        }
        $nextStepDetail = $curStep->nextStep;
        if ($nextStepDetail) {
            $taskStepFlow[] = [
                'step_id' => $nextStepDetail['id'],
                'step_name' => $nextStepDetail['name'],
                'status' => 1,
                'next_assignee_name' => $assignee ? $assignee['name'] : "",
            ];
            $children->task_step_flow = json_encode($taskStepFlow);
            $children->save();
            return $children['task_step_flow'];
        }
    }
    public function updateTaskStepFlow(Task $task, $status = null, ?User $nextAssignee = null)
    {
        $taskStepFlow = json_decode($task['task_step_flow'], true);
        foreach ($taskStepFlow as $index => $step) {
            if ($step['step_id'] === $task['step_id']) {
                $taskStepFlow[$index]['status'] = $status;
                if ($nextAssignee && isset($taskStepFlow[$index + 1])) {
                    $taskStepFlow[$index + 1]['next_assignee_name'] = $nextAssignee['name'];
                }
                break;
            }
        }
        $task->task_step_flow = json_encode($taskStepFlow);
        $task->status = $status;
        $task->save();
    }
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $task = Task::find($id);
        if ($task->qc_status) {
            return response()->json(["message" => "Công việc đã được xác nhận không được sửa"]);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'date',
            'parent_id' => 'nullable',
            'project_id' => 'required|exists:projects,id',
            'category_id' => 'required'
        ]);

        $task->name = $validated['name'];
        $task->description = $validated['description'];
        if ($user['role'] && $user['department'] == 3) {
            $task->due_date = $validated['due_date'];
        }
        $task->save();
        // xử lý file khi update
        $project_files = ProjectFile::where('uploaded_by', auth()->id())->where('task_id', $id)->first();
        // trường hợp request có gửi file
        if ($request->hasFile("files")) {
            // file từ request 
            $allFiles = (array) $request->file("files");
            // có tồn tại project_file trong database
            if ($project_files) {
                $old_files = json_decode($project_files->file_list);
                //xử lý yêu cầu xóa file 
                if ($request->delete_files) {
                    $deletedFiles = $request->delete_files;
                    // sắp xếp theo thứ tự giảm dần
                    rsort($deletedFiles);
                    // xoa file 
                    foreach ($deletedFiles as $index) {
                        if (isset($old_files[$index])) { // Ensure index exists
                            Storage::disk('public')->delete($old_files[$index]->file_path);
                            array_splice($old_files, $index, 1); // Remove from original array
                        }
                    }
                }
                $fileList = array_values($old_files);
                foreach (array_values($allFiles) as $file) {
                    $fileList[] = [
                        "file_name" => $file->getClientOriginalName(),
                        "file_path" =>  $file->store("project_files/" . $task->project_id, "public"),
                    ];
                }
                // update trên database 
                $project_files->update([
                    'file_list' => json_encode($fileList),
                ]);
                return response()->json(['message' => 'Task updated successfully!', 'old_files' => $fileList], 200);
            } else {
                // có gửi file nhưng không tồn tại project_files trong databse
                $allFiles = $request->file("files");
                if ($allFiles) {
                    foreach ($allFiles as $file) {
                        $fileList[] = [
                            "file_name" => $file->getClientOriginalName(),
                            "file_path" => $file->store("project_files/" . $task->project_id, "public")
                        ];
                    }
                }
                // tạo project_file mới 
                $newProjectFiles = ProjectFile::create([
                    'task_id' => $id,
                    'project_id' => $task->project_id,
                    'uploaded_by' => auth()->id(),
                    'file_list' => json_encode($fileList),
                ]);
                return response()->json(["message" => "Task updated"], 200);
            }
        } else {
            // trường hợp không gửi file nhưng project_files trong db có tồn tại và có request xóa file 
            // update khi không có file 
            if ($project_files) {
                $old_files = json_decode($project_files->file_list);
                if ($request->delete_files) {
                    $deletedFiles = $request->delete_files;
                    rsort($deletedFiles);
                    // xoa file 
                    foreach ($deletedFiles as $index) {
                        if (isset($old_files[$index])) { // Ensure index exists
                            Storage::disk('public')->delete($old_files[$index]->file_path);
                            array_splice($old_files, $index, 1); // Remove from original array
                        }
                    }
                }
                $project_files->file_list = array_values($old_files);
                $project_files->save();
            }
        }
        return response()->json(
            [
                'message' => 'Task updated successfully!',
                'status' => $task->step_id,
            ],
            200
        );
    }
    public function delete(Request $request, $id)
    {
        $task = Task::find($id);
        // check if the task created by 
        if ($task) {
            if ($task->created_by !== auth()->id()) {
                return response()->json(['message' => "You can't delete this comment"], 200);
            }
            $task->delete();
            return response()->json(['message' => 'Task deleted successfully!', 'task' => $task], 200);
        } else {
            return response()->json(["message" => "comment not exist"]);
        }
    }
    // lấy task của user ở tab My Task
    public function getUserTasks(Request $request)
    {
        $page = $request->page > 0 ? $request->page : 0;
        $user = auth()->user();
        $tasks = Task::with(["category", "creator", "assignee", "statusDetails", 'project'])
            ->whereIn('step_id', [2, 3, 5, 6])
            ->whereIn('status', [2, 5])
            ->where('next_assignee_id', $user['id'])
            ->orderBy('updated_at', 'desc')
            ->skip(15 * $page)
            ->take(16)
            //task mới do account khởi tạo
            ->get();
        $hasMore = $tasks->count() < 16 ? false : true;
        return response()->json(["tasks" => $tasks->take(15), 'hasMore' => $hasMore]);
    }
    public function getNPageUserTasks(Request $request)
    {
        $page = $request->page > 0 ? $request->page : 1;
        $user = auth()->user();
        $tasks = Task::with(["category", "creator", "assignee", "statusDetails", 'project'])
            ->whereIn('step_id', [2, 3, 5, 6])
            ->whereIn('status', [2, 5])
            ->where('next_assignee_id', $user['id'])
            ->orderBy('updated_at', 'desc')
            ->take(15 * $page + 1)
            //task mới do account khởi tạo
            ->get();
        $hasMore = $tasks->count() < 15 * $page + 1 ? false : true;
        return response()->json(["tasks" => $tasks->take(15), 'hasMore' => $hasMore]);
    }

    public function getTaskFiles(Request $request, $id)
    {
        $taskFiles = ProjectFile::where("task_id", $id)->get();
        return response()->json(["files" => $taskFiles]);
    }
    public function getLeaderTask(Request $request)
    {
        $user = auth()->user();
        if (!$user->role) {
            return response()->json(['message' => 'bạn không thể xem trang này']);
        }
        $tasks = Task::with(["department.members", "category", "creator", "assignee", "statusDetails", 'project'])
            ->where('next_assignee_id', $user->id)
            ->where("status", 1)
            ->whereIn('step_id', values: [2, 5])
            //task mới do account khởi tạo
            ->orderBy('updated_at', 'desc')
            ->get();
        return response()->json(["tasks" => $tasks]);
    }
    public function getMemberTask(Request $request)
    {
        $user = auth()->user();
        $tasks = Task::with(["category", "creator", 'assignee', "statusDetails", 'project'])
            ->where('next_assignee_id', '=', $user->id)
            ->whereIn('step_id', [3, 6]) // content member và design làm task
            ->whereIn('status', [1, 3, 4])
            //task mới do account khởi tạo
            ->orderBy('updated_at', 'desc')
            ->get();
        return response()->json(["tasks" => $tasks]);
    }
    public function updateTask(Request $request, $id)
    {
        $task = Task::find($id);
        if ($task['next_assignee_id'] === auth()->id()) {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
            ]);
            $task->update(
                [
                    'name' => $validated['name'],
                    'description' => $validated['description']
                ]
            );
            $this->updateTaskFiles($task, $request);
            return response()->json(['message' => 'Cập nhật thành công']);
        } else {
            return response()->json(['message' => 'Bạn không thể cập nhật task này']);
        }
    }
    public function assignTask(Request $request, $id)
    {
        // update leader task
        $leaderTask = Task::find($id);
        if (!$leaderTask) {
            return;
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|integer',
            'step_order' => 'required|integer',
            'due_date' => 'required|date',
            'project_id' => 'required|exists:projects,id',
            'assignee' => 'required|integer|exists:users,id',
        ]);
        // thêm status cancled?
        $previousTask = Task::where("id", $id)->first();
        // update leader task
        if ($validated['name']) {
            $previousTask->name = $validated['name'];
        }
        if ($validated['description']) {
            $previousTask->description = $validated['description'];
        }
        $assginee = User::find($validated['assignee']);
        $this->updateTaskStepFlow($previousTask, 2, $assginee);
        // create member tasks
        // tạo project file nếu có file
        if ($request->hasFile('files')) {
            $fileList = [];
            $allFiles = (array) $request->file("files");
            foreach (array_values($allFiles) as $file) {
                $fileList[] = [
                    "file_name" => $file->getClientOriginalName(),
                    "file_path" =>  $file->store("project_files/" . $leaderTask->project_id, "public"),
                ];
            }
            $newProjectFiles = ProjectFile::create(
                [
                    'task_id' => $leaderTask->id,
                    'project_id' => $leaderTask->project_id,
                    'uploaded_by' => auth()->id(),
                    'file_list' =>  json_encode($fileList),
                ]
            );
        }
        $curStep = TaskWorkFlows::where("category_id", $validated["category_id"])
            ->where("step_order", $validated['step_order'])
            ->first();
        if ($leaderTask['feedback']) {
            // nếu người dc chọn khác với người làm cũ thì đánh dấu người làm cũ 
            $previousMemberTask = Task::where('parent_task_id', $leaderTask['parent_task_id'])
                ->whereNot('next_assignee_id', $validated['assignee'])
                ->where('step_id', $curStep['next_step_id'])
                ->get();
            foreach ($previousMemberTask as $task) {
                $task['status'] = 5;
                $task->feedback = $leaderTask['feedback'];
                $task->save();
            }
        }
        if ($validated['category_id'] == 1 || $validated['category_id'] == 2) {
            $newTask = Task::create([
                'parent_id' => $previousTask['id'],
                'project_id' => (int)$validated['project_id'],
                'name' => $previousTask['name'],
                'description' => '',
                'next_assignee_id' => (int) $validated['assignee'],
                'status' => 1,
                'category_id' => 4, // brief 
                'step_id' => $curStep['next_step_id'],
                'step_order' => 1,
                'created_by' => auth()->id(),
                'due_date' => $previousTask['due_date'],
                'department_id' => $previousTask['department_id'],
                'parent_task_id' => $previousTask['parent_task_id'],
                'feedback' => $previousTask['feedback']
            ]);
            $this->addTaskStepFlow($previousTask, $newTask,   null, $leaderTask->assignee);
        }
        // assign task khong co parent
        if ($validated['category_id'] == 4 || $validated['category_id'] == 3) {
            $newTask = Task::create([
                'parent_id' => $previousTask['id'],
                'project_id' => (int)$validated['project_id'],
                'name' => $validated['name'],
                'description' => '',
                'next_assignee_id' => (int) $validated['assignee'],
                'status' => 1,
                'category_id' => $validated['category_id'], // brief 
                'step_id' => $curStep['next_step_id'],
                'step_order' => $curStep['step_order'] + 1,
                'created_by' => auth()->id(),
                'due_date' => $previousTask['due_date'],
                'department_id' => $previousTask['department_id'],
                'parent_task_id' => $previousTask['parent_task_id'],
                'feedback' => $previousTask['feedback']
            ]);
            $this->addTaskStepFlow($previousTask, $newTask,    null, $leaderTask->assignee);
        }
        $this->copyParentDescriptionAndFile($previousTask, $request, $id);
        return response()->json(['message' => 'Công việc được giao thành công!']);
    }
    public function submitTask(Request $request, $id)
    {
        // set task status
        $user = auth()->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|integer',
            'step_order' => 'required|integer',
            'due_date' => 'required|date',
            'project_id' => 'required|exists:projects,id',
        ]);
        $previousTask = Task::find($id);
        $nextStep = TaskWorkFlows::where('category_id', $validated['category_id'])
            ->where('step_order', $validated["step_order"] + 1)->first();
        $nextDepartment = Department::find($nextStep['department']);
        // đồng thời tạo task post caption cho member trước nếu category là 4
        // chỉ tạo task post caption khi ở bước 3 và category 4 và không tạo lại khi submit task bị từ chối
        // return response()->json(['message' => ($previousTask['status'] !== 3 && $previousTask['status'] !== 4)]);


        if ($previousTask) {
            if ($validated['description']) {
                $previousTask->description = $validated['description'];
            }
            if ($validated['name']) {
                $previousTask->name = $validated['name'];
            }
            $previousTask->save();
            $this->updateTaskStepFlow($previousTask, 2);
        }

        $nextTaskStatus = null;
        if ($previousTask['status'] === 4) {
            $nextTaskStatus = 4;
        } else {
            $nextTaskStatus = $previousTask['next_assignee_id'] === $nextDepartment['manager'] ? 2 : 1;
        }
        // create qc task for department leader
        $newTask = Task::create([
            'parent_id' => $previousTask['id'],
            'project_id' => $previousTask['project_id'],
            'name' => $previousTask['name'],
            'description' => $previousTask['next_assignee_id'] === $nextDepartment['manager'] ? $request->description : '',
            'next_assignee_id' => $nextDepartment['manager'],
            'status' => $nextTaskStatus,
            'category_id' => $previousTask['category_id'], // brief 
            'step_id' => $nextStep['current_step_id'],
            'step_order' => $nextStep['step_order'],
            'created_by' => auth()->id(),
            'due_date' => $previousTask['due_date'],
            'department_id' => $previousTask['department_id'],
            'parent_task_id' => $previousTask['parent_task_id'],
            'feedback' => $previousTask['feedback']
        ]);
        $nextLeaderStep = TaskWorkFlows::where('category_id', $newTask['category_id'])
            ->where('step_order', $newTask['step_order'] + 1)->first();
        $nextLeaderDepartment = $nextLeaderStep->currentDepartment()->first();
        $nextLeader = $nextLeaderDepartment->manager()->first();
        $memberFlow = $this->addTaskStepFlow($previousTask, $newTask, null, $nextLeader);
        // xử lý file nếu có 

        if ($request->hasFile('files') || $request->delete_files) {

            $fileList = [];
            $projectFiles = ProjectFile::where("task_id", $previousTask['id'])->first();
            // kiểm tra task đã có file chưa
            if ($projectFiles) {
                $old_files = json_decode($projectFiles->file_list);
                //xử lý yêu cầu xóa file 
                if ($request->delete_files) {
                    $deletedFiles = $request->delete_files;
                    // sắp xếp theo thứ tự giảm dần
                    rsort($deletedFiles);
                    // xoa file 
                    foreach ($deletedFiles as $index) {
                        if (isset($old_files[$index])) { // Ensure index exists
                            Storage::disk('public')->delete($old_files[$index]->file_path);
                            array_splice($old_files, $index, 1); // Remove from original array
                        }
                    }
                }
                $fileList = array_values($old_files);
                $allFiles = (array) $request->file("files");
                foreach (array_values($allFiles) as $file) {
                    $fileList[] = [
                        "file_name" => $file->getClientOriginalName(),
                        "file_path" =>  $file->store("project_files/" . $previousTask->project_id, "public"),
                    ];
                }
                // update trên database 
                $projectFiles->update([
                    'file_list' => json_encode($fileList),
                ]);
            } else {

                $allFiles = (array) $request->file("files");
                foreach (array_values($allFiles) as $file) {
                    $fileList[] = [
                        "file_name" => $file->getClientOriginalName(),
                        "file_path" =>  $file->store("project_files/" . $previousTask->project_id, "public"),
                    ];
                }
                $newProjectFiles = ProjectFile::create(
                    [
                        'task_id' => $previousTask->id,
                        'project_id' => $previousTask->project_id,
                        'uploaded_by' => auth()->id(),
                        'file_list' =>  json_encode($fileList),
                    ]
                );
            }

            if ($previousTask['next_assignee_id'] === $nextDepartment['manager']) {
                // sao chép file vào task tạo tự động khi người làm là leader
                $qcProjectFiles = ProjectFile::create(
                    [
                        'task_id' => $newTask->id,
                        'project_id' => $newTask->project_id,
                        'uploaded_by' => auth()->id(),
                        'file_list' =>  json_encode($fileList),
                    ]
                );
            }
        }
        $this->copyParentDescriptionAndFile($previousTask, $request, $id);
        if ($previousTask['category_id'] == 4 && $previousTask['step_id'] == 3  && ($previousTask['status'] !== 3 && $previousTask['status'] !== 4)) {
            $postCaptionTask = Task::create([
                'parent_id' => $previousTask['parent_id'],
                'project_id' => $previousTask['project_id'],
                'name' => $previousTask['name'],
                'description' => '',
                'next_assignee_id' => $previousTask['next_assignee_id'], //gửi cho leader 
                'status' => 1,
                'category_id' => 5,
                'step_id' => 3,
                'step_order' => 1,
                'created_by' => auth()->id(),
                'due_date' => $previousTask['due_date'],
                'department_id' =>  $nextDepartment['id'],
                'parent_task_id' => $previousTask['parent_task_id'],
                'task_step_flow' => $previousTask['task_step_flow'],
            ]);
        }
        // lấy team leader của người làm 
        if ($previousTask['next_assignee_id'] === $nextDepartment['manager']) {
            // call taskQC and approve
            $qcResponse = $this->taskQC($request, id: $newTask['id']);

            // return response()->json(["message" => $qcResponse]);
        }
        return response()->json(["message" => "Task submitted!"]);
    }
    // lấy tất cả các task cần QC
    public function getTaskQC(Request $request)
    {

        $user = auth()->user();
        // if ($user["role"]) {
        //     return;
        // }
        // get leader task qc
        $qcTasks = Task:: //task đã hoàn thành
            where('status', [1, 3, 4])
            ->whereIn('step_id', [4, 7])
            ->where('next_assignee_id',   $user['id'])
            ->with(['creator', 'project', 'category', 'assignee'])
            ->orderby('updated_at', "desc")
            ->orderBy('due_date', 'asc')

            ->get();
        // $groupQcTasks = $qcTasks->groupBy('project.id')->values();
        return response()->json(['qc_task' => $qcTasks]);
    }
    // update qc_status cho task 
    public function taskQC(Request $request, $id)
    {
        $isApproved = filter_var($request->approve, FILTER_VALIDATE_BOOL);

        $validated = $request->validate([
            'qc_note' => [Rule::requiredIf(!$isApproved), 'string'],
            'description' => 'nullable|string',
            'name' => 'required|string|max:255',
        ]);

        // leader qc task
        $task = Task::find($id);
        //lấy task của member vừa làm
        $memberTask = $task->parent;

        if ($task &&  $memberTask) {
            //

            if ($memberTask->status !== 2) {
                return response()->json(['message' => "Task is not completed"], 200);
            }

            if ($isApproved) {

                // cập nhật trạng thái task member
                $memberTask->update(
                    [
                        'qc_status' =>   $isApproved,
                    ]
                );
                if ($request->description) {
                    $task->description = $validated['description'];
                }
                if ($validated['name']) {
                    $task->name = $validated['name'];
                }
                $task->save();
                if ($request->hasFile("files")) {
                    // file từ request 
                    // thieu file trong qc submit
                    $allFiles = (array) $request->file("files");
                    $fileList = [];
                    if ($allFiles) {
                        foreach ($allFiles as $file) {
                            $fileList[] = [
                                "file_name" => $file->getClientOriginalName(),
                                "file_path" => $file->store("project_files/" . $task->project_id, "public")
                            ];
                        }
                    }
                    // tạo project_file mới 
                    $newProjectFiles = ProjectFile::create([
                        'task_id' => $id,
                        'project_id' => $task->project_id,
                        'uploaded_by' => auth()->id(),
                        'file_list' => json_encode($fileList),
                    ]);
                }
                // add file from request
                // update task step flow
                $this->updateTaskStepFlow($task, 2);


                // tạo task mới cho team design nếu đang ở bước 4 content leader qc hoặc gửi cho account ở bước 7
                if ($task['step_id'] === 4 || $task['step_id'] === 7) {
                    $nextStepOrder = $task['step_order'] + 1;
                    $nextStep = TaskWorkFlows::where('category_id', $task['category_id'])->where('step_order', $nextStepOrder)->first();
                    // find the next step department
                    $nextDepartment = Department::find($nextStep['department']);
                    $newTask = Task::create([
                        'parent_id' => $task['id'],
                        'project_id' => $task['project_id'],
                        'name' => $task['name'],
                        'description' => '',
                        'next_assignee_id' => $nextDepartment['manager'], //gửi cho leader 
                        'status' => 1,
                        'category_id' => $task['category_id'],
                        'step_id' => $nextStep['current_step_id'],
                        'step_order' => $nextStep['step_order'],
                        'created_by' => auth()->id(),
                        'due_date' => $task['due_date'],
                        'department_id' =>  $nextDepartment['id'],
                        'parent_task_id' => $task['parent_task_id'],
                        'feedback' => $task['feedback']
                    ]);
                    $this->addTaskStepFlow($task, $newTask, null);
                }
            } else {
                // nếu decline thì chuyển trạng thái task từ hoàn thành sang in progress
                $this->updateTaskStepFlow($memberTask, 3);
                $memberTask->update([
                    'qc_status' => $isApproved,
                    'qc_note' => $request->qc_note,
                ]);
            }
            $task->status = 2;
            $task->save();
            $parent_file = $this->copyParentDescriptionAndFile($task, $request, $id);
            return response()->json(['message' =>  "QC status updated!"], 200);
        } else {
            return response()->json(['message' => "QC fail,task not exist"], 403);
        }
    }
    public function getQCHistory(Request $request)
    {
        $user = auth()->user();
        // get leader task qc
        $qcTasks = Task:: //task đã hoàn thành
            whereNotNull('qc_status')
            ->where('created_by', $user['id'])
            ->with(['creator', 'project', 'category', 'assignee'])
            ->orderby('updated_at', "desc")
            ->orderBy('due_date', 'asc')
            ->skip(15 * $request->page)
            ->take(16)
            ->get();
        $hasMore = $qcTasks->count() < 16 ? false : true;
        return response()->json(['qc_task_history' => $qcTasks->take(15), 'has_more' => $hasMore]);
    }

    public function getAccountTask(Request $request)
    {
        $user = auth()->user();
        if ($user["department"] !== 3) {
            return response()->json(['message' => 'Bạn không thể vào trang này']);
        }
        $tasks = Task::with(["department.members", "category", "creator", "assignee", 'statusDetails', 'project'])
            ->where('next_assignee_id', $user->id)
            ->where("status", 1)
            ->where('step_id', 8)
            ->orderBy('updated_at', 'desc')
            ->get();
        return response()->json(["tasks" => $tasks]);
    }
    public function getTaskById(Request $request, $id)
    {
        $task = Task::with(['creator', 'assignee', 'taskComments', 'projectFiles', 'category'])->find($id);
        if ($task) {
            return response()->json([
                'task' => $task,
            ]);
        }
    }
    public function taskFeedback(Request $request, $id)
    {
        // account task
        $task = Task::where('id', $id)->first();
        // executor task
        $executorTask = Task::where("parent_task_id", $task['parent_task_id'])
            ->where('category_id', $task['category_id'])
            ->where("step_id", 3)->first();
        $executorTask->feedback = $request->feedback;
        $executorTask->status = 4;
        $executorTask->qc_status = null;
        // update task step flow
        $this->updateTaskStepFlow($executorTask, 4);
        $executorTask->save();
        $task->status = 2;
        $task->save();
        return response()->json(['message' => 'Gửi feedback thành công!']);
    }
    public function addFeedback(Task $task, $feedback)
    {
        if ($task) {
            $task->feedback = $feedback;
            $task->status = 4;
            $task->qc_status = null;
            $this->updateTaskStepFlow($task, 4);
            $task->save();
        } else {
            return response()->json(['message' => 'Công việc không tồn tại']);
        }
    }
    public function accountCompleteTask(Request $request, $id)
    {
        $task = Task::find($id);
        $validated = $request->validate([
            'description' => 'nullable|string',
            'name' => 'required|string|max:255',
        ]);
        if ($validated['description']) {
            $task->description = $validated['description'];
        }
        if ($validated['name']) {
            $task->name = $validated['name'];
        }
        $task->save();
        $this->updateTaskFiles($task, $request);
        // task cuối của flow
        $task = Task::find($id);
        if ($task) {
            $task->status = 2;
            $task->save();
            $this->updateTaskStepFlow($task, 2);
        } else {
            return response()->json(['message' => "Không tồn tại công việc này"]);
        }

        $group_task = Task::where('parent_task_id', $task['parent_task_id'])->where('step_id', 8)->get();
        // kiểm tra toàn bộ task account con
        $allDone = true;
        foreach ($group_task as $task) {
            if ($task['status'] !== 2) {
                $allDone = false;
                break;
            }
        }
        // nếu toàn bộ task con đều hoàn thành thì cập nhật
        if ($allDone) {
            $parent_task = Task::find($task['parent_task_id']);
            $parent_task->status = 2;
            $parent_task->save();
        }
        $this->copyParentDescriptionAndFile($task, $request, $id);
        return response()->json(['message' => "Success"]);
    }
    public function accountTaskHistory(Request $request)
    {
        $user = auth()->user();
        if (!$user['role']) {
            return response()->json(['message' => 'Bạn không thể vào trang này'], 402);
        }
        $tasks = Task::with(["department.members", "category", "creator", "assignee", 'statusDetails', 'project'])
            ->where('step_id', 8)
            ->where('status', 2)
            ->skip(15 * $request->page)
            ->take(16)
            ->orderBy('updated_at', 'desc')
            ->get();
        $hasMore = $tasks->count() < 16 ? false : true;
        return response()->json(['tasks' => $tasks->take(15), 'hasMore' => $hasMore]);
    }
    public function updateTaskFiles(Task $previousTask, Request $request)
    {
        if ($request->hasFile('files') || $request->delete_files) {
            $fileList = [];
            $projectFiles = ProjectFile::where("task_id", $previousTask['id'])->first();
            // kiểm tra task đã có file chưa
            if ($projectFiles) {
                $old_files = json_decode($projectFiles->file_list);
                //xử lý yêu cầu xóa file 
                if ($request->delete_files) {
                    $deletedFiles = $request->delete_files;
                    // sắp xếp theo thứ tự giảm dần
                    rsort($deletedFiles);
                    // xoa file 
                    foreach ($deletedFiles as $index) {
                        if (isset($old_files[$index])) { // Ensure index exists
                            Storage::disk('public')->delete($old_files[$index]->file_path);
                            array_splice($old_files, $index, 1); // Remove from original array
                        }
                    }
                }
                $fileList = array_values($old_files);
                $allFiles = (array) $request->file("files");
                foreach (array_values($allFiles) as $file) {
                    $fileList[] = [
                        "file_name" => $file->getClientOriginalName(),
                        "file_path" =>  $file->store("project_files/" . $previousTask->project_id, "public"),
                    ];
                }
                // update trên database 
                $projectFiles->update([
                    'file_list' => json_encode($fileList),
                ]);
            } else {
                $allFiles = (array) $request->file("files");
                foreach (array_values($allFiles) as $file) {
                    $fileList[] = [
                        "file_name" => $file->getClientOriginalName(),
                        "file_path" =>  $file->store("project_files/" . $previousTask->project_id, "public"),
                    ];
                }
                $newProjectFiles = ProjectFile::create(
                    [
                        'task_id' => $previousTask->id,
                        'project_id' => $previousTask->project_id,
                        'uploaded_by' => auth()->id(),
                        'file_list' =>  json_encode($fileList),
                    ]
                );
            }
        }
    }
    public function copyParentDescriptionAndFile(Task $task, $request, $id)
    {
        $projectFiles = ProjectFile::where('task_id', $task['id'])->first();
        // if ((!$task['description'] || !$projectFiles) && $task->parent) {

        //     $parent = $task->parent;
        //     if (!$task['description']) {
        //         $task->description =  $parent['description'];
        //     }
        //     // $projectFiles = ProjectFile::find($id);
        //     if (!$projectFiles) {
        //         $parentProjectFiles = $parent->projectFiles()->first();
        //         if ($parentProjectFiles) {
        //             if (!$projectFiles) {
        //                 $projectFiles = ProjectFile::create([
        //                     'task_id' => $task['id'],
        //                     'project_id' => $task->project_id,
        //                     'uploaded_by' => auth()->id(),
        //                     'file_list' => $parentProjectFiles['file_list']
        //                 ]);
        //             } else {
        //                 $projectFiles->file_list = $parentProjectFiles['file_list'];
        //             }
        //         }
        //     }
        //     $task->save();
        //     return $projectFiles;
        // } 
        if ((!$task['description'] || (!$request->hasFile('files') && !$request->delete_files)) && $task->parent) {
            $parent = $task->parent;
            if (!$task['description']) {
                $task->description =  $parent['description'];
            }
            // $projectFiles = ProjectFile::find($id);
            if (!$request->hasFile('files') && !$request->delete_files) {
                $parentProjectFiles = $parent->projectFiles()->first();
                if ($parentProjectFiles) {
                    if (!$projectFiles) {
                        $projectFiles = ProjectFile::create([
                            'task_id' => $task['id'],
                            'project_id' => $task->project_id,
                            'uploaded_by' => auth()->id(),
                            'file_list' => $parentProjectFiles['file_list']
                        ]);
                    } else {
                        $projectFiles->file_list = $parentProjectFiles['file_list'];
                    }
                }
            }
            $task->save();
            return $projectFiles;
        } else {
            return;
        }
    }
}
