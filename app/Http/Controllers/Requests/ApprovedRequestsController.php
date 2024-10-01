<?php

namespace App\Http\Controllers\Requests;

use App\Http\Controllers\Controller;
use App\Models\InputDetailRequest;
use App\Models\RequestApproval;
use App\Models\RequestTemplate;
use App\Models\User;
use App\Models\UserRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApprovedRequestsController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $query = $request->input('query');
        $categoryId = $request->input('category');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');

        $userList = User::pluck('name', 'id')->all();
        $inputDetailRequests = InputDetailRequest::get(['input_description', 'input_name', 'input_type']);
        $memberUser = User::where('direct_manager', $userId)->get();

        // Lấy danh sách request_id từ request_approval dựa trên user_id và status = 1
        $approvedRequestIds = RequestApproval::where('user_id', $userId)
            ->where('status', 1)
            ->pluck('request_id');

        // Truy vấn bảng UserRequests bằng cách kiểm tra request_id nằm trong danh sách approvedRequestIds
        $approvedRequests = UserRequests::whereIn('user_requests.id', $approvedRequestIds) // Thêm user_requests trước cột id
            ->join('users', 'users.id', '=', 'user_requests.id_user')
            ->join('request_templates', 'user_requests.request_template', '=', 'request_templates.id')
            ->select('user_requests.*', 'request_templates.template_name', 'users.name as user_name',)
            ->when($categoryId, function ($queryBuilder, $categoryId) {
                return $queryBuilder->where('request_templates.id', $categoryId);
            })
            ->when($startDate, function ($queryBuilder, $startDate) {
                return $queryBuilder->where('user_requests.created_at', '>=', $startDate);
            })
            ->when($endDate, function ($queryBuilder, $endDate) {
                return $queryBuilder->where('user_requests.created_at', '<=', $endDate);
            })
            ->when($query, function ($queryBuilder, $query) {
                return $queryBuilder->where(function ($subQuery) use ($query) {
                    $subQuery->where('user_requests.request_name', 'like', '%' . $query . '%')
                        ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(user_requests.content_request, '$.ho_va_ten')) LIKE ?", ['%' . $query . '%']);
                });
            })
            ->orderBy('user_requests.created_at', 'desc')
            ->paginate(10);


        return Inertia::render('Requests/Approved_requests', compact('approvedRequests', 'userList', 'inputDetailRequests'));
    }
}
