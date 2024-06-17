<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\RequestTemplate;
use App\Models\User;
use App\Models\UserRequests;
use App\Models\InputDetailRequest;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $query = $request->input('query');
        $categoryId = $request->input('category');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');

        $userRequestsQuery = UserRequests::where('id_user', $userId)
            ->join('request_templates', 'user_requests.request_template', '=', 'request_templates.id')
            ->select('user_requests.*', 'request_templates.template_name')
            ->when($query, function ($queryBuilder, $query) {
                return $queryBuilder->where('user_requests.request_name', 'like', '%' . $query . '%');
            })
            ->when($categoryId, function ($queryBuilder, $categoryId) {
                return $queryBuilder->where('request_templates.id', $categoryId);
            })
            ->when($startDate, function ($queryBuilder, $startDate) {
                return $queryBuilder->where('user_requests.created_at', '>=', $startDate);
            })
            ->when($endDate, function ($queryBuilder, $endDate) {
                return $queryBuilder->where('user_requests.created_at', '<=', $endDate);
            })
            ->orderBy('user_requests.created_at', 'desc');

        $userRequests = $userRequestsQuery->paginate(10);

        $userList = User::pluck('name', 'id')->all();
        $allTemplate = RequestTemplate::all();
        $inputDetailRequests = InputDetailRequest::get(['input_description', 'input_name', 'input_type']);
        $memberUser = User::where('direct_manager', $userId)->get();

        // Get requests for the members of the current user
        $memberUserIds = $memberUser->pluck('id')->toArray();
        $needApprove = UserRequests::whereIn('id_user', $memberUserIds)
            ->where('status', 0)
            ->where('fully_accept', '<>', 1)
            ->where('fully_accept', '<>', 2)
            ->join('users', 'users.id', '=', 'user_requests.id_user')
            ->join('request_templates', 'user_requests.request_template', '=', 'request_templates.id')
            ->select('user_requests.*', 'request_templates.template_name', 'users.name as user_name', 'request_templates.flow_of_approvers')
            ->get();

        if ($userId == 36) { // Dành cho các request mà các qltt đã duyệt cần sếp duyệt
            $needFullyAccept = UserRequests::where('status', 1)
                ->where('fully_accept', 0)
                ->join('users', 'users.id', '=', 'user_requests.id_user')
                ->join('request_templates', 'user_requests.request_template', '=', 'request_templates.id')
                ->select('user_requests.*', 'request_templates.template_name', 'users.name as user_name')
                ->get();
            $needApprove = $needApprove->concat($needFullyAccept);
        }

        return Inertia::render('Dashboard', compact('allTemplate', 'userRequests', 'needApprove', 'inputDetailRequests', 'userList'));
    }
}
