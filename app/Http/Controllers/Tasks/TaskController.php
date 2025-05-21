<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Mail\AccountCreateTaskEmail;
use App\Mail\DeleteTaskMail;
use App\Mail\DepartmentFinishTaskEmail;
use App\Mail\ErrorMail;
use App\Mail\LeaderAssignTaskEmail;
use App\Mail\MemberSubmitTaskEmail;
use App\Mail\TaskDeadlineUpdateEmail;
use App\Mail\TaskStatusChangeEmail;
use App\Mail\TaskUpdateEmail;
use App\Models\Department;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\StatusDetails;
use App\Models\StepDetail;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskUser;
use App\Models\TaskWorkFlows;
use App\Models\User;
use App\Models\UserDepartment;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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
        if ($newTask) {
            try {
                Mail::to($department_leader['email'])->send(new AccountCreateTaskEmail($newTask, $user, $nextDepartment->department_name));
            } catch (Exception $e) {
                Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($newTask, $e->getMessage()));
            }
        }
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
        $isAccount =  $user->isDepartment(3);
        // return response()->json(['message' =>  $user->isDepartment(4)]);
        $task = Task::find($id);
        if ($task->qc_status) {
            return response()->json(["message" => "Công việc đã được xác nhận không được sửa"]);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'member_due_date' => 'nullable|string',
            'parent_id' => 'nullable',
            'project_id' => 'required|exists:projects,id',
            'category_id' => 'required'

        ]);

        $task->name = $validated['name'];
        $task->description = $validated['description'];
        // 

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

        $haveDeadlineConflict = false;
        if ($request->member_due_date && $request->member_due_date !== $task['due_date']) {
            // leader update task   
            $this->updateTaskDeadline($task, $validated['member_due_date'], $user);
        }
        if ($request->due_date && $request->member_due_date !== $task['due_date']) {
            // account update task 
            $lastChildrenTask = Task::where('parent_task_id', $id)->where('due_date', '>', $validated['due_date'])->orderBy('created_at', 'desc')->first();
            if ($lastChildrenTask) {
                $haveDeadlineConflict = $lastChildrenTask;
                // update mail send 
            } else {
                $this->updateTaskDeadline($task, $validated['due_date'], $user);
            }
        }
        try {
            $receiver = $task->assignee;
            Mail::to($receiver['email'])->send(new TaskUpdateEmail($task, $user->name));
        } catch (Exception $e) {
            Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($task, $e->getMessage()));
        }
        return response()->json(
            [
                'message' => 'Task updated successfully!',
                'status' => $task->step_id,
                'deadlineConflict' => $haveDeadlineConflict
            ],
            200
        );
    }

    public function updateTaskDeadline(Task $task, $due_date, $user)
    {
        if (empty($task['parent_id'])) {
            // trường hợp account đổi deadline
            $childrenTask = Task::where('parent_task_id', $task['id'])->get();
            $taskDepartment = null;
            foreach ($childrenTask as $childTask) {
                $childTask->update([
                    'due_date' => $due_date
                ]);
                $taskDepartment = $childTask->department;
            }
            // gửi mail cho leader
            $manager = $taskDepartment->manager()->get();
            $task->update(['due_date' => $due_date]);
            // gửi mail
            // try {
            //     $receiver = $task->assignee;
            //     Mail::to($manager['email'])->send(new TaskDeadlineUpdateEmail($task, $user->name));
            // } catch (Exception $e) {
            //     // Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($task, $e->getMessage()));
            //     Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($task, $manager->email));
            // }
        } else {
            // trường hợp leader đổi deadline
            $childrenTask = Task::where('parent_id', $task['id'])->orderBy('created_at', 'desc')->get();
            foreach ($childrenTask as $child) {
                $child->update(
                    [
                        'due_date' => $due_date
                    ]
                );
            }
            //Gửi mail cho member
            // $lastTaskMember = $childrenTask[0]->assignee;
            // try {
            //     $receiver = $childrenTask[0]->assignee;
            //     Mail::to($receiver['email'])->send(new TaskDeadlineUpdateEmail($childrenTask[0], $lastTaskMember->name));
            // } catch (Exception $e) {
            //     Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($childrenTask[0], $e->getMessage()));
            // }
        }
    }
    public function delete(Request $request, $id)
    {
        $task = Task::find($id);
        $user = auth()->user();
        // check if the task created by 
        if ($task) {
            if ($task->created_by !== auth()->id()) {
                return response()->json(['message' => "You can't delete this comment"], 200);
            }
            // lấy email của các user 
            // $childrenTaskAssigneeIds = Task::where('parent_task_id', $task['id'])
            //     ->distinct()
            //     ->pluck('next_assignee_id');
            // $emails = User::whereIn('id', $childrenTaskAssigneeIds)->pluck('email');
            $task->delete();
            // gửi email
            // foreach ($emails as $email) {
            //     try {
            //         Mail::to($email)->send(new DeleteTaskMail($task, $user->name));
            //     } catch (Exception $e) {
            //         Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($task, $e->getMessage()));
            //     }
            // }

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
        $tasks = Task::with(["category", "creator", "assignee", "statusDetails", 'project', 'department'])
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
        $tasks = Task::with(["category", "creator", "assignee", "statusDetails", 'project', 'department'])
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
        $tasks = Task::with(["category", "creator", 'assignee', "statusDetails", 'project', 'department'])
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
            // search the last the send email order by create at  
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
                'due_date' => $validated['due_date'],
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
                // 'due_date' => $previousTask['due_date'],
                'due_date' => $validated['due_date'],
                'department_id' => $previousTask['department_id'],
                'parent_task_id' => $previousTask['parent_task_id'],
                'feedback' => $previousTask['feedback']
            ]);
            $this->addTaskStepFlow($previousTask, $newTask, null, $leaderTask->assignee);
        }

        $this->copyParentDescriptionAndFile($previousTask, $request, $id);
        try {
            $receiver = $newTask->assignee;
            Mail::to($receiver['email'])->send(new LeaderAssignTaskEmail($newTask, auth()->user()->name));
        } catch (Exception $e) {
            Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($newTask, $e->getMessage()));
        }
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

        $parent_task = Task::where('id', $previousTask['parent_task_id'])->first();
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
            'due_date' => $parent_task['due_date'],
            'department_id' => $previousTask['department_id'],
            'parent_task_id' => $previousTask['parent_task_id'],
            'feedback' => $previousTask['feedback']
        ]);
        $nextLeaderStep = TaskWorkFlows::where('category_id', $newTask['category_id'])
            ->where('step_order', $newTask['step_order'] + 1)->first();
        $nextLeaderDepartment = $nextLeaderStep->currentDepartment()->first();
        // kiểm tra xem bước sau phải account không, nếu lá account thì lấy người tạo task lớn thay vì leader
        if ($nextLeaderDepartment['id'] === 3) {
            $parentTask = $this->getParentTask($newTask);
            $nextLeader = $parentTask->creator;
        } else {
            $nextLeader = $nextLeaderDepartment->manager()->first();
        }
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
        }
        $this->copyParentDescriptionAndFile($previousTask, $request, $id);
        // if ($previousTask['category_id'] == 4 && $previousTask['step_id'] == 3  && ($previousTask['status'] !== 3 && $previousTask['status'] !== 4) && empty($previousTask['feedback'])) {
        if ($previousTask['category_id'] == 4 && $previousTask['step_id'] == 3  && (empty($previousTask['feedback']) && empty($previousTask['qc_note']))) {
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
        }
        if ($previousTask) {
            try {
                $receiver = $previousTask->assignee;
                Mail::to($receiver['email'])->send(new MemberSubmitTaskEmail($previousTask, $user->name, $previousTask->category));
            } catch (Exception $e) {
                Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($previousTask, $e->getMessage()));
            }
        }
        return response()->json(["message" => "Task submitted!"]);
    }
    // lấy tất cả các task cần QC
    public function getTaskQC(Request $request)
    {
        $user = auth()->user();
        // get leader task qc
        $qcTasks = Task:: //task đã hoàn thành
            where('status', [1, 3, 4])
            ->whereIn('step_id', [4, 7])
            ->where('next_assignee_id',   $user['id'])
            ->with(['creator', 'project', 'category', 'assignee', 'department'])
            ->orderby('updated_at', "desc")
            ->orderBy('due_date', 'asc')
            ->get();
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
                    // gửi cho người tạo task
                    // kiểm tra bước tiếp theo phải là phòng account hay không
                    $isAccount = $nextDepartment['id'] === 3;
                    // return response()->json(['message' =>   $isAccount], 200);
                    if ($isAccount) {
                        $parentTask = Task::find($task['parent_task_id']);
                        $parentTask = Task::find($task['parent_task_id']);
                        $parentTaskCreator = $parentTask['created_by'];
                    }
                    $newTask = Task::create([
                        'parent_id' => $task['id'],
                        'project_id' => $task['project_id'],
                        'name' => $task['name'],
                        'description' => '',
                        'next_assignee_id' =>  $isAccount ? $parentTaskCreator : $nextDepartment['manager'], //gửi cho leader 
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
                    $currentDepartment = Department::find($task['department_id']);

                    // gửi mail cho team kế tiếp
                    try {
                        $receiver = $newTask->assignee;
                        Mail::to($receiver['email'])->send(new DepartmentFinishTaskEmail($newTask, auth()->user()->name, $currentDepartment['department_name'], $nextDepartment['department_name']));
                    } catch (Exception $e) {
                        Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($newTask, $e->getMessage()));
                    }
                }
            } else {
                // nếu decline thì chuyển trạng thái task từ hoàn thành sang in progress
                $this->updateTaskStepFlow($memberTask, 3);
                $memberTask->update([
                    'qc_status' => $isApproved,
                    'qc_note' => $request->qc_note,
                ]);
            }
            // gửi mail
            try {
                $receiver = $memberTask->assignee;
                Mail::to($receiver['email'])->send(new TaskStatusChangeEmail($memberTask, auth()->user()->name));
            } catch (Exception $e) {
                Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($memberTask, $e->getMessage()));
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
        // lấy các task đã qc
        $qcTasks = Task::whereNotNull('qc_status')->pluck('id');
        // lấy các task có parent thuộc task đã qc
        $tasksHistory = Task::whereIn('parent_id', $qcTasks)
            ->where('next_assignee_id', $user['id'])
            ->with(['creator', 'project', 'category', 'assignee', 'statusDetails', 'department'])
            ->orderby('updated_at', "desc")
            ->orderBy('due_date', 'asc')
            ->skip(15 * $request->page)
            ->take(16)
            ->get();

        $hasMore = $tasksHistory->count() < 16 ? false : true;
        return response()->json(['qc_task_history' => $tasksHistory->take(15), 'has_more' => $hasMore]);
    }
    public function getNQCHistory(Request $request)
    {
        $page = $request->page;
        $user = auth()->user();
        // get leader task qc
        // lấy các task đã qc
        $qcTasks = Task::whereNotNull('qc_status')->pluck('id');
        // lấy các task có parent thuộc task đã qc
        $tasksHistory = Task::whereIn('parent_id', $qcTasks)
            ->where('next_assignee_id', $user['id'])
            ->with(['creator', 'project', 'category', 'assignee', 'statusDetails', 'department'])
            ->orderby('updated_at', "desc")
            ->orderBy('due_date', 'asc')
            ->take(15 * $page + 1)
            ->get();

        $hasMore = $tasksHistory->count() < 15 * $page + 1 ? false : true;
        return response()->json(['qc_task_history' => $tasksHistory->take(15 * $page), 'has_more' => $hasMore]);
    }
    public function getAccountTask(Request $request)
    {
        $user = auth()->user();
        $isAccountMember = UserDepartment::where('user_id', auth()->id())
            ->where('department_id', 3)
            ->first();
        if (empty($isAccountMember)) {
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
            ->where('status', 2)
            ->where("step_id", 3)->latest()->first();
        $executorTask->feedback = $request->feedback;
        // Tạo mới task cho member
        $newExecutorTask = Task::create([
            'parent_id' => $executorTask['id'],
            'project_id' => $executorTask['project_id'],
            'name' => $executorTask['name'],
            'description' => $executorTask['description'],
            'next_assignee_id' => $executorTask['next_assignee_id'],
            'status' => 4,
            'category_id' => $executorTask['category_id'], // brief 
            'step_id' => $executorTask['step_id'],
            'step_order' => $executorTask['step_order'],
            'created_by' => $executorTask['created_by'],
            'due_date' => $executorTask['due_date'],
            'department_id' => $executorTask['department_id'],
            'parent_task_id' => $executorTask['parent_task_id'],
            'task_step_flow' => $executorTask['task_step_flow'],
            'feedback' => $request->feedback
        ]);
        $this->updateTaskStepFlow($newExecutorTask, 4);
        $task->status = 2;
        $task->save();
        try {
            $receiver = $newExecutorTask->assignee;
            Mail::to($receiver['email'])->send(new TaskStatusChangeEmail($newExecutorTask, auth()->user()->name));
        } catch (Exception $e) {
            Mail::to('duongvihien01@gmail.com')->send(new ErrorMail($newExecutorTask, $e->getMessage()));
        }
        return response()->json(['message' => 'Gửi feedback thành công!']);
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
        // đánh dấu hoàn thành
        $taskStepFlow = json_decode($task['task_step_flow'], true);
        $stepFlowLength = array_key_last($taskStepFlow);
        $taskStepFlow[$stepFlowLength]['status'] = 2;
        $task->task_step_flow = json_encode($taskStepFlow);
        $task->save();
        //  $taskStepFlow

        // check toàn bộ task con bất kể step_id
        $group_task = Task::where('parent_task_id', $task['parent_task_id'])->get();
        // kiểm tra toàn bộ task account con
        $allDone = true;
        foreach ($group_task as $task) {
            // task chưa hoàn thành hoặc bị hủy
            if ($task['status'] === 1) {
                $allDone = false;
                break;
            }
        }
        // nếu toàn bộ task con đều hoàn thành thì cập nhật trạng thái parent task id là hoàn thành
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
        $tasks = Task::with(["department.members", "category", "creator", "assignee", 'statusDetails', 'project'])
            ->where('next_assignee_id', $user['id'])
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
        if ((!$task['description'] || (!$request->hasFile('files') && !$request->delete_files)) && $task->parent) {
            $parent = $task->parent;
            if (!$task['description']) {
                $task->description =  $parent['description'];
            }
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
    // Lấy task lớn
    public function getParentTask(Task $task)
    {
        $parentTask = Task::where('id', $task['parent_task_id'])->first();
        if ($parentTask) {
            return $parentTask;
        }
    }
    public function updateAllTaskDeadline(Request $request, $id)
    {
        $task = Task::find($id);

        $user = auth()->user();
        // $this->updateTaskDeadline($task, $request->deadline, $user);
        return response()->json(['message' => 'Deadline updated!']);
    }
    public function fetchAllTask(Request $request)
    {
        $page = $request->page;
        $tasks = Task::with(["category", "creator", 'assignee', "statusDetails", 'project', 'department'])
            ->orderBy('created_at', 'desc')
            ->skip(15 * $page)
            ->take(16)
            ->get();
        $hasMore = $tasks->count() < 16 ? false : true;
        return response()->json(["tasks" => $tasks->take(15), 'hasMore' => $hasMore]);
    }
}
