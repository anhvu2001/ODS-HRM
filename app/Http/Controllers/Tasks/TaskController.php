<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\PriorityLevel;
use App\Models\ProjectFile;
use App\Models\ProjectParticipant;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    //
    public function getPriorityOption()
    {
        $priorities = PriorityLevel::all(['id', 'name']);
        return response()->json($priorities);
    }
    public function createMainTask(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date|after_or_equal:today',
            'due_date' => 'required|date|after_or_equal:start_date',
            'priority_id' => 'required|integer',
            'participant' => 'required|exists:users,id',
            'parent_id' => 'nullable|exists:users,id',
            'project_id' => 'required|exists:projects,id',
        ]);
        // create main task
        $newTask = Task::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'created_by' => auth()->id(),
            'status_id' => 1, // default là chưa bắt đầu 
            'priority_id' => $validated['priority_id'],
            'start_date' => $validated['start_date'],
            'due_date' => $validated['due_date'],
            'parent_id' => null,
            'project_id' => $validated['project_id'],
        ]);
        $newTask->depth = $newTask->ancestors()->count();
        $newTask->save();
        // // create user do task
        $participant = $validated['participant'];
        $userTask = TaskUser::create([
            'task_id' => $newTask->id, // id của task vừa tạo
            'user_id' => $participant,
            'status_id' => 1,
        ]);
        // add executor to project participants 
        $newParticipant = ProjectParticipant::firstOrCreate([
            'project_id' => $validated['project_id'],
            'user_id' => $participant,
        ], [
            'role_id' => 3,
        ]);
        return response()->json(['message' => 'Task created successfully!', 'task' => $newParticipant], 200);
    }
    public function createSubTask(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date|after_or_equal:today',
            'due_date' => 'required|date|after_or_equal:start_date',
            'priority_id' => 'required|integer',
            'participant' => 'required|exists:users,id',
            'parent_id' => 'nullable|exists:tasks,id',
            'project_id' => 'required|exists:projects,id',
        ]);

        $newTask = Task::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'created_by' => auth()->id(),
            'status_id' => 1, // default là chưa bắt đầu 
            'priority_id' => $validated['priority_id'],
            'start_date' => $validated['start_date'],
            'due_date' => $validated['due_date'],
            'project_id' => $validated['project_id'],
        ]);
        // create user do task
        $participant = $validated['participant'];
        $userTask = TaskUser::create([
            'task_id' => $newTask->id, // id của task vừa tạo
            'user_id' => $participant,
            'status_id' => 1,
        ]);
        $parent_task = Task::find($validated['parent_id']);

        $parent_task->appendNode($newTask);
        $newTask->depth = $newTask->ancestors()->count();
        $newTask->save();
        // add project participants  
        $newParticipant = ProjectParticipant::firstOrCreate([
            'project_id' => $validated['project_id'],
            'user_id' => $participant,
        ], [
            'role_id' => 3,
        ]);

        return response()->json(['message' => 'Task created successfully!'], 200);
    }
    public function update(Request $request, $id)
    {

        $task = Task::find($id);
        if ($task->qc_status) {
            return response()->json(["message" => "Công việc đã được xác nhận không được sửa"]);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'participant' => 'required|exists:users,id',
            'priority_id' => 'required|integer',
            'status' => 'required|integer',
            'description' => 'nullable|string',
            'start_date' => 'required|date|',
            'due_date' => 'required|date|after_or_equal:start_date',
        ]);
        $task->name = $validated['name'];
        $task->description = $validated['description'];
        $task->status_id = $validated['status'];
        $task->priority_id = $validated['priority_id'];
        $task->start_date = $validated['start_date'];
        $task->due_date = $validated['due_date'];
        $curExecutor = $task->taskUser;
        $curExecutor->update([
            'user_id' => $validated['participant'],
            'status_id' => $task->status_id,
        ]);
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
                'executor' => $curExecutor->status_id,
                'status' => $task->status_id,
            ],
            200
        );
    }
    public function delete(Request $request, $id)
    {
        $task = Task::find($id);
        // check if the task created by 
        if ($task->created_by !== auth()->id()) {
            return response()->json(['message' => "You can't delete this comment"], 200);
        }

        if ($task) {
            $task->delete();
        } else {
            return response()->json(["message" => "comment not exist"]);
        }
        return response()->json(['message' => 'Task deleted successfully!', 'task' => $task], 200);
    }
    // lấy task của user ở tab My Task
    public function getUserTasks(Request $request)
    {
        $page = $request->page > 0 ? $request->page : 0;
        if ($request->projectsStatus) {
            $userTasks = TaskUser::with(['task.creator', 'task.projectFiles', 'task.taskUser'])
                ->join('tasks', 'task_users.task_id', '=', 'tasks.id')
                ->join('projects', 'tasks.project_id', '=', 'projects.id')
                ->where('user_id', auth()->id())
                ->where("tasks.status_id", $request->projectsStatus)
                ->orderby('tasks.created_at', "desc")
                ->orderBy('tasks.due_date', 'asc')
                ->orderBy('tasks.priority_id', 'asc')
                ->orderBy('tasks.qc_status', 'asc')
                ->get();
        } else {
            $userTasks = TaskUser::with(['task.creator', 'task.projectFiles', 'task.taskUser'])
                ->join('tasks', 'task_users.task_id', '=', 'tasks.id')
                ->join('projects', 'tasks.project_id', '=', 'projects.id')
                ->where('user_id', auth()->id())
                ->whereIn("tasks.status_id", [2, 1])
                ->orderby('tasks.created_at', "desc")
                ->orderBy('tasks.due_date', 'asc')
                ->orderBy('tasks.priority_id', 'asc')
                ->orderBy('tasks.qc_status', 'asc')
                ->get();
        }
        // group by project id
        $groupedTasks = $userTasks->groupBy(function ($taskUser) {
            return $taskUser->task->project->id;
        })
            ->skip(5 * $page)
            ->take(6)
            ->values();
        $hasMore = $groupedTasks->count() >= 6;
        $response = $groupedTasks->take(5)->toArray();

        return response()->json(["groupedTasks" => $response, "hasMore" => $hasMore]);
    }
    // my task list load more 
    public function getMoreTask(Request $request, $id)
    {
        $page = $request->page;
        // get project with status code
        if ($request->projectsStatus) {
            $userTasks = TaskUser::with(['task.creator', 'task.taskUser'])
                ->join('tasks', 'task_users.task_id', '=', 'tasks.id')
                ->join('projects', 'tasks.project_id', '=', 'projects.id')
                ->where('user_id', auth()->id())
                ->where("tasks.status_id", $request->projectsStatus)
                ->where('project_id', $id)
                ->orderby('tasks.updated_at', "desc")
                ->orderBy('tasks.due_date', 'asc')
                ->orderBy('tasks.priority_id', 'asc')
                ->orderBy('tasks.qc_status', 'asc')
                ->skip(5 * $request->page)
                ->take(6)
                ->get();
        } else {
            // get not start or in progress projects
            $userTasks = TaskUser::with(['task.creator', 'task.taskUser'])
                ->join('tasks', 'task_users.task_id', '=', 'tasks.id')
                ->join('projects', 'tasks.project_id', '=', 'projects.id')
                ->where('user_id', auth()->id())
                ->whereIn("tasks.status_id", [1, 2])
                ->where('project_id', $id)
                ->orderby('tasks.updated_at', "desc")
                ->orderBy('tasks.due_date', 'asc')
                ->orderBy('tasks.priority_id', 'asc')
                ->orderBy('tasks.qc_status', 'asc')
                ->skip(5 * $request->page)
                ->take(6)
                ->get();
        }
        $hasMore = $userTasks->count() < 6 ? false : true;
        return response()->json(['userTasks' => $userTasks->take(5), 'hasMore' => $hasMore]);
    }
    public function getUpdatedTask(Request $request, $id)
    {
        if ($request->projectsStatus) {
            $userTasks = TaskUser::with(['task.creator', "task.taskUser"])
                ->join('tasks', 'task_users.task_id', '=', 'tasks.id')
                ->join('projects', 'tasks.project_id', '=', 'projects.id')
                ->where('user_id', auth()->id())
                ->where("tasks.status_id", $request->projectsStatus)
                ->where('project_id', $id)
                ->orderby('tasks.updated_at', "desc")
                ->orderBy('tasks.due_date', 'asc')
                ->orderBy('tasks.priority_id', 'asc')
                ->orderBy('tasks.qc_status', 'asc')
                ->take($request->pages)
                ->get();
        } else {
            // get "not start" or in progress projects
            $userTasks = TaskUser::with(['task.creator', "task.taskUser"])
                ->join('tasks', 'task_users.task_id', '=', 'tasks.id')
                ->join('projects', 'tasks.project_id', '=', 'projects.id')
                ->where('user_id', auth()->id())
                ->whereIn("tasks.status_id", [1, 2])
                ->where('project_id', $id)
                ->orderby('tasks.updated_at', "desc")
                ->orderBy('tasks.due_date', 'asc')
                ->orderBy('tasks.priority_id', 'asc')
                ->orderBy('tasks.qc_status', 'asc')
                ->get();
        }
        $hasMore = $userTasks->count() > $userTasks->take($request->pages)->count() ? true : false;
        return response()->json([
            'userTasks' => $userTasks->take($request->pages),
            'hasMore' => $hasMore
        ]);
    }
    public function getTaskAfterUpdate(Request $request, $id)
    {
        if ($request->projectsStatus) {
            $userTasks = TaskUser::with(['task.creator'])
                ->join('tasks', 'task_users.task_id', '=', 'tasks.id')
                ->join('projects', 'tasks.project_id', '=', 'projects.id')
                ->where('user_id', auth()->id())
                ->where('project_id', $id)
                ->where('tasks.status_id', $request->projectsStatus)
                ->orderby('tasks.updated_at', "desc")
                ->orderBy('tasks.due_date', 'asc')
                ->orderBy('tasks.priority_id', 'asc')
                ->orderBy('tasks.qc_status', 'asc')
                ->skip(5)
                ->take(5 * $request->curPage)
                ->get();
        } else {
            $userTasks = TaskUser::with(['task.creator'])
                ->join('tasks', 'task_users.task_id', '=', 'tasks.id')
                ->join('projects', 'tasks.project_id', '=', 'projects.id')
                ->where('user_id', auth()->id())
                ->where('project_id', $id)
                ->whereIn('tasks.status_id', [1, 2])
                ->orderby('tasks.updated_at', "desc")
                ->orderBy('tasks.due_date', 'asc')
                ->orderBy('tasks.priority_id', 'asc')
                ->orderBy('tasks.qc_status', 'asc')
                ->skip(5)
                ->take(5 * $request->curPage)
                ->get();
        }
        return response()->json(['userTasks' => $userTasks]);
    }
    // lấy tất cả các task cần QC
    public function getTaskQC()
    {
        $qcTasks = Task::where('created_by', '=', auth()->id())
            ->where('status_id', '=', 3)
            ->where(function ($query) {
                $query->whereNull('qc_status')
                    ->orWhere('qc_status', 0);
            })
            ->with(['creator', 'taskUser.user', 'priority', 'project'])
            ->orderby('updated_at', "desc")
            ->orderBy('due_date', 'asc')
            ->orderBy('priority_id', 'asc')
            ->get();
        $groupQcTasks = $qcTasks->groupBy('project.id')->values();
        return response()->json($groupQcTasks);
    }
    // update qc_status cho task 
    public function taskQC(Request $request, $id)
    {

        $task = Task::find($id);
        if ($task) {
            // 
            if ($task->status_id !== 3) {
                return response()->json(['message' => "Task is not completed"], 200);
            }
            if ($request->approve) {
                $task->update(
                    [
                        'qc_status' => $request->approve,
                    ]
                );
            } else {
                // nếu decline thì chuyển trạng thái task từ hoàn thành sang in progress
                $task->update([
                    'qc_status' => $request->approve,
                    'status_id' => 2,
                ]);
            }
            return response()->json(['message' => "QC status updated"], 200);
        } else {
            return response()->json(['message' => "QC fail,task not exist"], 403);
        }
    }
    public function getQCHistory(Request $request)
    {
        $user_id = auth()->id();
        $qcHistory = Task::select([
            'tasks.*',
            'projects.id AS project_id',
            'projects.name AS project_name',
            'projects.created_at AS project_created_at',
            'projects.updated_at AS project_updated_at'
        ])
            ->with(['creator', 'taskUser.user', 'priority', 'project'])
            ->join("projects", "tasks.project_id", "=", "projects.id")
            ->whereNotNull('qc_status')
            ->where("tasks.created_by", "=", $user_id)
            ->orderBy("projects.created_at", "desc")
            ->orderBy("tasks.updated_at", 'desc')
            ->skip(15 * $request->page)
            ->take(15)
            ->get();
        $groupedTask = $qcHistory->groupBy('project.id')->values();
        $hasMore = $qcHistory->count() < 15 ? false : true;
        return response()->json(["projects" => $groupedTask, 'hasMore' => $hasMore]);
    }
    public function getTaskFiles(Request $request, $id)
    {
        $taskFiles = ProjectFile::where("task_id", $id)->get();
        return response()->json(["files" => $taskFiles]);
    }
}
