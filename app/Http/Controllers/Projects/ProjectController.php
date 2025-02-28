<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectParticipant;
use App\Models\Status;
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
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'participants' => 'nullable|array',
            'participants.*' => 'exists:users,id', // Đảm bảo các ID người tham gia là hợp lệ
        ]);

        // Lưu dữ liệu vào bảng projects
        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'created_by' => auth()->id(), // Người tạo (user hiện tại)
            'status_id' => 1, // Mặc định trạng thái là 1
        ]);

        // Lấy danh sách người tham gia
        $participantIds = $validated['participants'];

        // Kiểm tra nếu người tạo chưa có trong danh sách người tham gia thì thêm vào
        if (!in_array(auth()->id(), $participantIds)) {
            $participantIds[] = auth()->id();
        }

        // Lưu người tham gia vào bảng project_participants
        foreach ($participantIds as $index => $userId) {
            ProjectParticipant::create([
                'project_id' => $project->id,
                'user_id' => $userId,
                'role_id' => $userId == auth()->id() ? 1 : 2, // Gán role 1 cho người tạo, role 2 cho người tham gia
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
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|exists:statuses,id', // ID trạng thái phải tồn tại trong bảng statuses
            'participants' => 'nullable|array',
            'participants.*' => 'exists:users,id', // Mỗi participant phải là ID hợp lệ trong bảng users
        ]);

        try {
            // Tìm dự án theo ID
            $project = Project::findOrFail($id);

            // Cập nhật thông tin dự án
            $project->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'status_id' => $validated['status'],
            ]);

            // Xử lý danh sách participants
            if (isset($validated['participants'])) {
                // Lấy danh sách người tham gia mới
                $newParticipantIds = $validated['participants'];

                // Kiểm tra nếu người tạo chưa có trong danh sách thì thêm vào
                if (!in_array(auth()->id(), $newParticipantIds)) {
                    $newParticipantIds[] = auth()->id();
                }

                // Xóa tất cả người tham gia cũ
                ProjectParticipant::where('project_id', $project->id)->delete();

                // Thêm lại danh sách người tham gia mới
                foreach ($newParticipantIds as $userId) {
                    ProjectParticipant::create([
                        'project_id' => $project->id,
                        'user_id' => $userId,
                        'role_id' => $userId == auth()->id() ? 1 : 2, // Gán role 1 cho người tạo, role 2 cho thành viên
                    ]);
                }
            }

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

            // Xóa tất cả người tham gia liên quan đến dự án
            ProjectParticipant::where('project_id', $id)->delete();

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

    public function getProjectsByUser()
    {
        $projects = Project::select(
            'projects.id',
            'projects.name',
            'projects.description',
            'projects.start_date',
            'projects.end_date',
            'statuses.name as status_name',
            'statuses.id as status_id'
        )
            ->join('statuses', 'projects.status_id', '=', 'statuses.id') // Liên kết với bảng statuses
            ->where('projects.created_by', auth()->id()) // Chỉ lấy dự án do người dùng hiện tại tạo
            ->with(['participants.user', 'participants.role', 'tasks.taskUser.user', 'tasks.status', 'tasks.creator']) // Tải trước thông tin người tham gia
            // tải thêm task của project và người làm task
            ->get();

        // Định dạng dữ liệu trả về
        $formattedProjects = $projects->map(function ($project) {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'start_date' => $project->start_date,
                'end_date' => $project->end_date,
                'status_name' => $project->status_name,
                'status_id' => $project->status_id,
                'participants' => $project->participants->map(function ($participant) {
                    return [
                        'id' => $participant->user->id,
                        'name' => $participant->user->name,
                        'role' => $participant->role->name,
                    ];
                }),
                // 12/02/2025
                // tai truoc task cua project
                'tasks' => $project->tasks
            ];
        });

        return response()->json($formattedProjects);
    }

    public function getAllStatus()
    {
        $statuses = Status::select('id', 'name')->get();
        return response()->json($statuses);
    }
}
