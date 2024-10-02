<?php

namespace App\Http\Controllers\Requests;

use App\Helpers\HelperFunctions;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserRequests;
use App\Models\RequestTemplate;
use App\Models\InputDetailRequest;
use App\Models\RequestApproval;
use App\Models\User;
use App\Models\UserRequestsApprover;
use DateTime;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class UserRequestController extends Controller
{
    public function index(Request $request)
    {
        // $userRequests = UserRequests::all();
        $query = $request->input('query');
        $categoryId = $request->input('category');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
        $allLeaderAdmin = User::whereIn('role', ['1', '99'])->get();
        $userList = User::pluck('name', 'id')->all();
        $inputDetailRequests = InputDetailRequest::get(['input_description', 'input_name', 'input_type']);

        $userRequests = UserRequests::join('users', 'user_requests.id_user', '=', 'users.id')
            ->join('request_templates', 'user_requests.request_template', '=', 'request_templates.id')
            ->select('user_requests.*', 'users.name as user_name', 'request_templates.template_name', 'request_templates.flow_of_approvers')
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
                return $queryBuilder->where(function ($q) use ($query) {
                    $q->where('user_requests.request_name', 'like', '%' . $query . '%')
                        ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(user_requests.content_request, '$.ho_va_ten')) LIKE ?", ['%' . $query . '%']);
                });
            })
            ->orderBy('user_requests.id', 'DESC')
            ->paginate(10);


        // Format the created_at field
        // foreach ($userRequests as $userRequest) {
        //     $date = DateTime::createFromFormat('d/m/Y', $userRequest->created_at);
        //     $userRequest->created_at = $date ? $date->format('d/m/Y') : 'Invalid date';
        // }
        return Inertia::render('Requests/Request_list', compact('userRequests', 'allLeaderAdmin', 'userList', 'inputDetailRequests'));
    }

    public function add_new_request_screen(Request $request)
    {
        $id_template = $request->id_template;
        $request_template = RequestTemplate::find($id_template);
        // $inputDetails = InputDetailRequest::find($id_template);
        $inputDetailRequests = InputDetailRequest::where('id_request_templates', $id_template)->get()->sortBy('priority')->values();;
        $allLeaderAdmin = User::whereIn('role', ['1', '99'])->get();
        $userList = User::pluck('name', 'id')->all();
        return Inertia::render('Requests/Create_request', compact('inputDetailRequests', 'allLeaderAdmin', 'id_template', 'userList', 'request_template'));
    }

    public function update_request_screen(Request $request)
    {
        $id = $request->id;
        $userRequest = UserRequests::find($id);
        $contentRequest = json_decode($userRequest['content_request'], true);
        $inputDetailRequests = InputDetailRequest::where('id_request_templates', $userRequest->request_template)->get();
        $request_template = RequestTemplate::find($userRequest->request_template);
        $allLeaderAdmin = User::whereIn('role', ['1', '99'])->get();
        $userList = User::pluck('name', 'id')->all();

        foreach ($inputDetailRequests as $inputDetail) {
            $key = $inputDetail['input_name'];
            if (isset($contentRequest[$key])) {
                $inputDetail['input_value'] = $contentRequest[$key];
            }
        }

        $allLeaderAdmin = User::whereIn('role', ['1', '99'])->get();
        $userList = User::pluck('name', 'id')->all();
        return Inertia::render('Requests/Edit_request', compact('inputDetailRequests', 'allLeaderAdmin', 'id', 'userList', 'request_template', 'userRequest'));
    }
    public function update_request_field(Request $request)
    {
        $requestAll = $request->all();
        $id_request = $requestAll['id_request'];
        $status = $requestAll['status']; // Trạng thái mới
        $user_id = auth()->id(); // ID của người dùng đang đăng nhập

        // Tìm bản ghi cần cập nhật trong bảng request_approval
        $requestApproval = RequestApproval::where('request_id', $id_request)
            ->where('user_id', $user_id)
            ->first();

        if ($requestApproval) {
            // Cập nhật trạng thái trong bảng request_approval
            $requestApproval->status = $status;
            $requestApproval->save();

            // Lấy thông tin yêu cầu và luồng phê duyệt
            $userRequest = UserRequests::find($id_request);
            $flowOfApprovers = json_decode($userRequest->flow_approvers, true);

            // Kiểm tra và cập nhật status trong flow_approvers
            foreach ($flowOfApprovers as &$approver) {
                if ($approver['user_id'] == $user_id) {
                    // Cập nhật status của người duyệt hiện tại
                    $approver['status'] = $status;
                    break; // Dừng vòng lặp sau khi tìm thấy user_id
                }
            }

            // Cập nhật lại trường flow_approvers sau khi thay đổi
            $userRequest->flow_approvers = json_encode($flowOfApprovers);
            $userRequest->save();

            // Lấy danh sách user_id từ flowOfApprovers
            $approverIds = array_column($flowOfApprovers, 'user_id');

            // Kiểm tra nếu có bất kỳ người nào từ chối
            $anyRejected = RequestApproval::where('request_id', $id_request)
                ->whereIn('user_id', $approverIds)
                ->where('status', 2) // Trạng thái từ chối
                ->exists();

            if ($anyRejected) {
                // Nếu có bất kỳ người nào từ chối
                $userRequest->fully_accept = 2;
            } else {
                // Nếu không có ai từ chối, kiểm tra xem tất cả đã duyệt chưa
                $allApproved = RequestApproval::where('request_id', $id_request)
                    ->whereIn('user_id', $approverIds)
                    ->where('status', 1) // Trạng thái đồng ý
                    ->count() === count($approverIds);

                if ($allApproved) {
                    // Nếu tất cả đã duyệt
                    $userRequest->fully_accept = 1;
                } else {
                    // Nếu chưa tất cả đã duyệt và không có ai từ chối
                    $userRequest->fully_accept = 0;
                }
            }

            $userRequest->save();

            return response()->json(['success' => true, 'message' => 'Status updated successfully.']);
        } else {
            return response()->json(['success' => false, 'message' => 'Request or user not found.']);
        }
    }


    public function create(Request $request)
    {
        $requestAll = $request->all();
        $userId = auth()->id(); // ID của người tạo đề xuất
        $requestName = $requestAll['request_name'];
        $idTemplate = $requestAll['id_template'];

        // Lấy thông tin từ bảng request_templates dựa trên id_template
        $template = RequestTemplate::find($idTemplate);

        if (!$template) {
            return response()->json(['status' => false, 'message' => 'Template not found'], 404);
        }

        // Lấy flow_of_approvers từ bảng request_templates
        $flowOfApprovers = json_decode($template->flow_of_approvers, true);

        // Xử lý file (nếu có)
        $fileResult = HelperFunctions::handleUploadsFiles($request->allFiles());

        // Thêm dữ liệu file vào $requestAll nếu có file
        $requestAll = array_merge($requestAll, $fileResult);

        $existingApprovers = [];

        foreach ($flowOfApprovers as $approver) {
            if (!isset($approver['user_id'])) continue;
            $approverId = $approver['user_id'];
            if ($approverId === 'qltt') {
                $creator = User::find($userId);
                if ($creator && $creator->direct_manager) {
                    $approverId = $creator->direct_manager; // Gán id của quản lý trực tiếp
                    // Kiểm tra nếu quản lý trực tiếp tồn tại trong bảng User
                    $manager = User::find($approverId);
                    if ($manager) {
                        // Nếu tìm thấy quản lý trực tiếp, gán thông tin name và role_code
                        $approverId = (int)$manager->id; // Gán id của quản lý trực tiếp và chuyển sang kiểu số nguyên
                        $approver['role'] = $manager->role_code; // Thêm role của quản lý trực tiếp
                        $approver['name'] = $manager->name; // Thêm tên của quản lý trực tiếp
                    }
                }
            } else {
                $user = User::where('role_code', $approverId)
                    ->whereIn('role', [1, 99])
                    ->first();
                if ($user) {
                    $approverId = $user->id; // Gán id thực tế của người dùng
                    $approver['role'] = $user->role_code; // Thêm role vào approver
                    $approver['name'] = $user->name; // Thêm role vào approver
                }
            }
            if ($approverId == $userId) {
                continue; // Bỏ qua nếu người tạo đề xuất trùng với người duyệt
            }

            if (!isset($existingApprovers[$approverId])) {
                $approver['user_id'] = $approverId; // Cập nhật user_id thực tế
                $existingApprovers[$approverId] = $approver;
            }
        }

        // Chuyển đổi mảng associatives thành mảng index
        $flowOfApprovers = array_values($existingApprovers);

        // Cập nhật lại trường 'flow_approvers' sau khi đã thay thế user_id thành ID thực tế
        $userRequest = UserRequests::create([
            'request_name' => $requestName,
            'category_id' => $idTemplate,
            'id_user' => $userId,
            'request_template' => $idTemplate,
            'content_request' => json_encode($requestAll, JSON_UNESCAPED_UNICODE),
            'flow_approvers' => json_encode($flowOfApprovers, JSON_UNESCAPED_UNICODE),
        ]);


        $newlyCreatedId = $userRequest->id;

        // Lưu dữ liệu vào bảng request_approval
        foreach ($flowOfApprovers as $approver) {
            RequestApproval::create([
                'request_id' => $newlyCreatedId,
                'user_id' => $approver['user_id'] ?? null,
                'order' => $approver['order'] ?? null,
                'status' => $approver['status'] ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Xử lý follower (nếu có)
        if ($followerValue = $request->input('follower')) {
            try {
                UserRequestsApprover::create([
                    'user_id' => $followerValue,
                    'id_request' => $newlyCreatedId,
                ]);
            } catch (\Throwable $th) {
                throw $th;
            }
        }

        return response()->json(['status' => true, 'id' => $newlyCreatedId]);
    }
    public function update(Request $request)
    {
        // Lấy tất cả dữ liệu từ request
        $requestAll = $request->all();
        $id_request = $requestAll['id'];
    
        // Lấy chi tiết đề xuất dựa trên id
        $requestDetail = UserRequests::find($id_request);
    
        // Tên đề xuất mới (nếu có)
        $requestName = $requestAll['request_name'];
        
        // Giải mã nội dung request ban đầu
        $requestContentOriginal = $requestDetail['content_request'];
        $arrayOriginal = json_decode($requestContentOriginal, true);    
       // Cập nhật các trường 
       foreach ($requestAll as $key => $value) {
        if ($key !== 'id' && $key !== 'request_name') {
            $arrayOriginal[$key] = $value; // Cập nhật giá trị mới cho các trường
        }
    }
        // Xử lý file nếu có file mới
        if ($request->allFiles()) {
            $allFiles = $request->allFiles();
            // Xử lý file mới và nhận kết quả
            $fileResult = HelperFunctions::handleUploadsFiles($allFiles);
            // Xóa file cũ và thay thế bằng file mới
            foreach ($fileResult as $name_input => $fileData) {
                if (!empty($fileData)) {
                    if (isset($arrayOriginal[$name_input])) {
                        unset($arrayOriginal[$name_input]);
                    }
                    $arrayOriginal[$name_input] = $fileData;
                }
            }
        }
        // Cập nhật lại flow_of_approvers nếu cần
        $idTemplate = $requestDetail->request_template;
        $template = RequestTemplate::find($idTemplate);
        if ($template) {
            $flowOfApprovers = json_decode($template->flow_of_approvers, true);
            $existingApprovers = [];
    
            foreach ($flowOfApprovers as $approver) {
                if (!isset($approver['user_id'])) continue;
                $approverId = $approver['user_id'];
                // Xử lý nếu là quản lý trực tiếp (qltt)
                if ($approverId === 'qltt') {
                    $creator = User::find($requestDetail->id_user);
                    if ($creator && $creator->direct_manager) {
                        $approverId = $creator->direct_manager;
                        $manager = User::find($approverId);
                        if ($manager) {
                            $approverId = (int)$manager->id;
                            $approver['role'] = $manager->role_code;
                            $approver['name'] = $manager->name;
                        }
                    }
                } else {
                    $user = User::where('role_code', $approverId)
                        ->whereIn('role', [1, 99])
                        ->first();
                    if ($user) {
                        $approverId = $user->id;
                        $approver['role'] = $user->role_code;
                        $approver['name'] = $user->name;
                    }
                }
    
                // Bỏ qua nếu người tạo đề xuất trùng với người duyệt
                if ($approverId == $requestDetail->id_user) {
                    continue;
                }
    
                if (!isset($existingApprovers[$approverId])) {
                    $approver['user_id'] = $approverId;
                    $existingApprovers[$approverId] = $approver;
                }
            }
            $flowOfApprovers = array_values($existingApprovers); // Cập nhật lại flow
        }
    
        // Mã hóa dữ liệu đã cập nhật thành JSON
        $json_data = json_encode($arrayOriginal, JSON_UNESCAPED_UNICODE);
    
        // Cập nhật lại dữ liệu trong cơ sở dữ liệu
        $requestDetail->update([
            'request_name' => $requestName,
            'content_request' => $json_data,
            'flow_approvers' => json_encode($flowOfApprovers, JSON_UNESCAPED_UNICODE),  // Cập nhật flow_approvers
        ]);
        // Cập nhật lại bảng request_approval
        RequestApproval::where('request_id', $id_request)->delete();  // Xóa các bản ghi phê duyệt cũ
        foreach ($flowOfApprovers as $approver) {
            RequestApproval::create([
                'request_id' => $id_request,
                'user_id' => $approver['user_id'] ?? null,
                'order' => $approver['order'] ?? null,
                'status' => $approver['status'] ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        return response()->json(['status' => true, 'data'=>$requestAll]);
    }
    public function delete(Request $request)
    {
        $id = $request->id;
        UserRequestsApprover::where('id_request', $id)->delete();
        $userRequest = UserRequests::find($id);
        $userRequest->delete();
        return response()->json(['status' => true]);
    }
}
