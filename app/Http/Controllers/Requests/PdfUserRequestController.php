<?php

namespace App\Http\Controllers\Requests;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\InputDetailRequest; // Import model InputDetailRequest
use App\Models\RequestApproval;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PdfUserRequestController extends Controller
{
    public function index($id)
    {
        // Lấy thông tin người dùng đang đăng nhập
        $loggedInUser = Auth::user();  // Sử dụng auth() để lấy người dùng đang đăng nhập

        // Truy vấn thông tin đề xuất, loại đề xuất và người tạo
        $userRequest = DB::table('user_requests')
            ->join('request_templates', 'user_requests.request_template', '=', 'request_templates.id')  // Join với bảng request_templates
            ->join('users as creator', 'user_requests.id_user', '=', 'creator.id')  // Join với bảng users để lấy thông tin người tạo
            ->leftJoin('users as manager', 'creator.direct_manager', '=', 'manager.id') // Join với bảng users để lấy thông tin quản lý
            ->where('user_requests.id', $id)  // Lọc theo id của bảng user_requests
            ->select(
                'user_requests.*',  // Lấy tất cả các cột của user_requests
                'request_templates.template_name as template_name',  // Lấy tên loại đề xuất từ bảng request_templates
                'creator.name as creator_name',  // Lấy tên người tạo từ bảng users
                'manager.name as manager_name'  // Lấy tên quản lý từ bảng users
            )
            ->first();  // Lấy bản ghi đầu tiên tìm thấy

        // Kiểm tra xem bản ghi có tồn tại không
        if (!$userRequest) {
            return response()->json(['error' => 'Request not found'], 404);
        }

        // Giải mã JSON từ content_request
        $contentRequest = json_decode($userRequest->content_request, true); // Chuyển đổi JSON thành mảng

        // Lấy thông tin từ bảng input_details
        $inputDetails = InputDetailRequest::where('id_request_templates', $userRequest->request_template)->get(['input_name', 'input_description']);

        // Lấy thông tin luồng phê duyệt
        $approvals = RequestApproval::where('request_id', $id)
            ->join('users', 'request_approval.user_id', '=', 'users.id') // Join với bảng users để lấy tên người phê duyệt
            ->orderBy('order') // Sắp xếp theo thứ tự
            ->select(
                'request_approval.*', // Lấy tất cả thông tin phê duyệt
                'users.name as approver_name', // Lấy tên người phê duyệt
                'users.role_code', // Lấy role_code từ bảng users
                'request_approval.updated_at' // Lấy ngày cập nhật từ bảng request_approval
            )
            ->get(); // Lấy tất cả bản ghi
        $comments = Comment::where('request_id', $id)
            ->join('users', 'comments.user_id', '=', 'users.id') // Join để lấy tên người bình luận
            ->select('comments.content', 'comments.updated_at', 'users.name as commenter_name')
            ->orderBy('comments.updated_at', 'desc') // Sắp xếp từ mới nhất đến cũ nhất
            ->get();

        // Xử lý content để thay thế chuỗi @{{...}} thành @Tên
        foreach ($comments as $comment) {
            $comment->content = preg_replace('/@\{\{[0-9]+\|\|([^\}]+)\}\}/', '@$1', $comment->content);
        }
        // Chuẩn bị dữ liệu để truyền vào view
        $data = [
            'id' => $userRequest->id,
            'request_name' => $userRequest->request_name,  // Tên đề xuất
            'creator' => $userRequest->creator_name,  // Tên người tạo (lấy từ bảng users)
            'manager' => $userRequest->manager_name,  // Tên quản lý (lấy từ bảng users)
            'exported_by' => $loggedInUser->name,  // Tên người đang đăng nhập
            'template_name' => $userRequest->template_name,  // Tên loại đề xuất (lấy từ bảng request_templates)
            'created_at' => date('d/m/Y H:i', strtotime($userRequest->created_at)),  // Ngày tạo
            'updated_at' => date('d/m/Y H:i', strtotime($userRequest->updated_at)),  // Ngày cập nhật
            'status' => $userRequest->fully_accept,  // Trạng thái
            'content_request' => $contentRequest,  // Nội dung chi tiết đề xuất
            'flow_approvers' => json_decode($userRequest->flow_approvers, true),  // Thông tin về luồng phê duyệt (dạng JSON)
            'input_details' => $inputDetails,  // Thông tin input_details
            'approvals' => $approvals,  // Thông tin luồng phê duyệt
            'comments' => $comments,  // Thông tin bình luận

        ];

        // Tạo PDF từ view 'Pdf-request'
        $pdf = Pdf::loadView('Pdf-request', $data);
        // Trả về nội dung PDF dạng blob cho Axios xử lý
        return $pdf->stream('request-' . $id . '.pdf');
    }
}
