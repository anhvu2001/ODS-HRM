<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\PriorityLevel;
use App\Models\ProjectParticipant;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskUser;
use Illuminate\Http\Request;


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
        // dd($validated);
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

        // return response()->json(['message' => 'Task created successfully!', 'task' => $newTask], 200);
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
        // add project participants  20/02/2025
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

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'participant' => 'required|exists:users,id',
            'priority_id' => 'required|integer',
            'status' => 'required|integer',
            'description' => 'nullable|string',
            'start_date' => 'required|date|',
            // 'start_date' => 'required|date|after_or_equal:today',
            'due_date' => 'required|date|after_or_equal:start_date',
        ]);
        $task = Task::find($id);
        $task->name = $validated['name'];
        $task->description = $validated['description'];
        $task->status_id = $validated['status'];
        $task->priority_id = $validated['priority_id'];
        $task->start_date = $validated['start_date'];
        $task->due_date = $validated['due_date'];
        // update TaskUser table 
        $curExecutor = $task->taskUser;
        $curExecutor->update([
            'user_id' => $validated['participant'],
            'status_id' => $task->status_id,
        ]);
        $task->save();
        return response()->json(['message' => 'Task updated successfully!', 'executor' => $curExecutor->status_id, 'status' => $task->status_id], 200);
    }
    public function delete(Request $request, $id)
    {
        // delete child task testing
        // deleting parent node
        $task = Task::find($id);
        // check if the task created by
        if ($task->created_by !== auth()->id()) {
            return response()->json(['message' => $task->id], 200);
        }
        // delete children node first
        $deletedLeft = $task->lft;
        $deletedRight = $task->rgt;
        // soft delete children task_users
        TaskUser::join('tasks', 'task_users.task_id', '=', 'tasks.id')->where('rgt', '<', $deletedRight)
            ->where('lft', '>', $deletedLeft)
            ->update(['task_users.deleted_at' => now()]);
        // soft delete children comments
        TaskComment::join('tasks', 'task_comments.task_id', '=', 'tasks.id')
            ->where('rgt', '<', $deletedRight)
            ->where('lft', '>', $deletedLeft)
            ->update(['task_comments.deleted_at' => now()]);
        // delete task user and comment for the main node
        TaskUser::where('task_id', $task->id)->delete();
        TaskComment::where('task_id', $task->id)->delete();
        // delete the main node
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully!', 'task' => $task], 200);
    }
    // lấy task của user ở tab My Task
    public function getUserTasks()
    {
        $userTasks = TaskUser::with(['task.creator'])
            ->join('tasks', 'task_users.task_id', '=', 'tasks.id')
            ->join('projects', 'tasks.project_id', '=', 'projects.id')
            ->where('user_id', auth()->id())
            ->orderBy('tasks.priority_id', 'asc')
            ->orderBy('tasks.due_date', 'asc')
            ->get();
        // group by project id
        $groupedTasks = $userTasks->groupBy(function ($taskUser) {
            return $taskUser->task->project->id;
        })->values();
        $response = $groupedTasks->toArray();

        return response()->json($response);
    }
}
