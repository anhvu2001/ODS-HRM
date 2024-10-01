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
        // Get requests for the members of the current user
        $needApprove = UserRequests::join('request_templates', 'user_requests.request_template', '=', 'request_templates.id')
            ->join('users', 'users.id', '=', 'user_requests.id_user')
            ->join('request_approval', 'user_requests.id', '=', 'request_approval.request_id')
            ->where('request_approval.user_id', $userId)  // Kiểm tra xem user hiện tại có trong danh sách phê duyệt
            ->where('request_approval.status', 0)  // Kiểm tra yêu cầu này đang chờ phê duyệt của user hiện tại
            ->where('request_approval.order', function ($query) use ($userId) {
                $query->select('order')
                    ->from('request_approval as ra2')
                    ->whereColumn('ra2.request_id', 'user_requests.id')
                    ->where('ra2.user_id', $userId)
                    ->limit(1);  // Lấy ra thứ tự duyệt hiện tại của user
            })
            ->whereNotExists(function ($query) {
                $query->select('id')
                    ->from('request_approval as ra_prev')
                    ->whereColumn('ra_prev.request_id', 'user_requests.id')
                    ->where('ra_prev.order', '<', function ($subquery) {
                        $subquery->select('order')
                            ->from('request_approval as ra_cur')
                            ->whereColumn('ra_cur.request_id', 'user_requests.id')
                            ->where('ra_cur.user_id', Auth::id())
                            ->limit(1);  // Lấy thứ tự của user hiện tại
                    })
                    ->where('ra_prev.status', '<>', 1);  // Kiểm tra tất cả người trước đó đã duyệt (status = 1)
            })
            ->select(
                'user_requests.*',
                'request_templates.template_name',
                'users.name as user_name',
                'request_templates.flow_of_approvers'
            )
            ->get();



        return Inertia::render('Dashboard', compact('allTemplate', 'userRequests', 'needApprove', 'inputDetailRequests', 'userList'));
    }
}
