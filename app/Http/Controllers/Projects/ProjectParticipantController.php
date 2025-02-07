<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectParticipant;
use Illuminate\Http\Request;

class ProjectParticipantController extends Controller
{
    public function getParticipantsByProjectId($projectId)
    {
        // Tìm dự án theo project_id
        $project = Project::find($projectId);

        if (!$project) {
            return response()->json(['message' => 'Project not found.'], 404);
        }

        // Lấy thông tin người tham gia
        $participants = ProjectParticipant::with('user', 'role') // Tải thông tin người dùng và vai trò
            ->where('project_id', $projectId)
            ->get()
            ->map(function ($participant) {
                return [
                    'id' => $participant->user_id,
                    'name' => $participant->user->name, // Lấy tên người tham gia
                    'role' => $participant->role->name, // Lấy tên vai trò
                ];
            });

        return response()->json($participants);
    }
}
