<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\DepartmentsProjects;
use App\Models\Project;
use App\Models\ProjectParticipant;
use App\Models\Status;
use App\Models\StatusDetails;
use App\Models\TaskUser;
use Beste\Json;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('Projects/MainLayout');
    }
    public function create(Request $request)
    {

        // Validate dữ liệu từ form
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'end_date' => 'required|date|',
            'project_departments' => 'required'
        ]);

        // Lưu dữ liệu vào bảng projects
        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'end_date' => $validated['end_date'],
            'created_by' => auth()->id(), // Người tạo (user hiện tại)
            'status' => 1, // Mặc định trạng thái là 0 chưa hoàn thành 
        ]);
        // Lấy danh sách người tham gia
        $projectDepartmentIds = $validated['project_departments'];

        // Kiểm tra nếu người tạo chưa có trong danh sách người tham gia thì thêm vào
        // Lưu người tham gia vào bảng project_participants
        foreach ($projectDepartmentIds as $departmentsId) {
            DepartmentsProjects::create([
                'project_id' => $project->id,
                'department_id' => $departmentsId,
            ]);
        }
        return response()->json(['message' => 'Project created successfully!'], 201);
    }
    public function update(Request $request, $id)
    {
        // Xác thực dữ liệu đầu vào
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'end_date' => 'required|date|after_or_equal:today',
            'status' => 'required|exists:status_details,id', // ID trạng thái phải tồn tại trong bảng statuses
        ]);

        try {
            // Tìm dự án theo ID
            $project = Project::findOrFail($id);
            // Cập nhật thông tin dự án
            $project->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                // 'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'status' => $validated['status'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Project updated successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update project. ' . $e->getMessage(),
            ], 500);
        }
    }
    public function delete($id)
    {
        try {
            // Tìm dự án theo ID
            $project = Project::findOrFail($id);
            // cascade soft delete trong models
            // Xóa dự án
            $project->delete();

            return response()->json([
                'success' => true,
                'message' => 'Project and participants deleted successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete project. ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getProjectsByUser(Request $request)
    {
        $user_id = auth()->id();
        $projects = Project::with(['departments.department', 'tasks.category', 'tasks.department', 'tasks.creator', 'tasks.assignee', 'tasks.statusDetails'])
            ->where('created_by', $user_id)
            ->skip($request->page * 5)
            ->take(6)
            ->orderBy('updated_at', 'desc')
            ->get();
        $hasMore = $projects->count() < 6 ? false : true;
        $formattedProject = $projects->take(5)->map(
            function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'created_by' => $project->created_by,
                    'description' => $project->description,
                    'end_date' => $project->end_date,
                    'departments' => $project->departments,
                    'status' => $project->statusDetails,
                    'tasks' => $project->tasks
                        ->filter(function ($task) {
                            if ($task->step_id == 1) {
                                return $task;
                            }
                        })->values()->toArray()
                ];
            }
        );
        return response()->json(['projects' => $formattedProject, 'hasMore' => $hasMore]);
    }
    public function getnPageProjects(Request $request)
    {
        $userId = auth()->id();
        $page = $request->page ? $request->page : 1;
        $projects = Project::with(['departments.department', 'tasks.category', 'tasks.department', 'tasks.creator', 'tasks.assignee', 'tasks.statusDetails'])
            ->where('created_by', $userId)
            ->take(5 * $page + 1)
            ->orderBy('updated_at', 'desc')
            ->get();
        $hasMore = $projects->count() < 5 * $page + 1 ? false : true;
        $formattedProject = $projects->take(5 * $page)->map(
            function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'created_by' => $project->created_by,
                    'description' => $project->description,
                    'end_date' => $project->end_date,
                    'departments' => $project->departments,
                    'status' => $project->statusDetails,
                    'tasks' => $project->tasks
                        ->filter(function ($task) {
                            if ($task->step_id == 1) {
                                return $task;
                            }
                        })->values()->toArray()
                ];
            }
        );
        return response()->json(['projects' => $formattedProject, 'hasMore' => $hasMore]);
    }

    // project page load more button
    public function getAllStatus()
    {
        $statuses = StatusDetails::select('id', 'name')->get();
        return response()->json($statuses);
    }
    public function getDeadline(Request $request, $id)
    {
        $project = Project::find($id);
        return response()->json($project['end_date']);
    }
}
