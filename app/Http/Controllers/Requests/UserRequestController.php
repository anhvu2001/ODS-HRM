<?php

namespace App\Http\Controllers\Requests;

use App\Helpers\HelperFunctions;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserRequests;
use App\Models\RequestTemplate;
use App\Models\InputDetailRequest;
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
        $field = $requestAll['field'];
        $field_value = $requestAll['field_value'];
        $userRequest = UserRequests::find($id_request);
        $userRequest->$field = $field_value;
        $userRequest->save();
    }
    public function create(Request $request)
    {
        $requestAll = $request->all();
        // Tách request_name và category_id ra khỏi $requestAll
        $requestName = $requestAll['request_name'];
        $categoryId = $requestAll['category_id'];
        // Xóa request_name và category_id khỏi $requestAll
        unset($requestAll['request_name']);
        unset($requestAll['category_id']);

        // Xử lý file
        $files = $request->allFiles();
        $fileResult = HelperFunctions::handleUploadsFiles($files);
        // Thêm dữ liệu file vào $requestAll
        if (!empty($fileResult)) {
            $requestAll = array_merge($requestAll, $fileResult);
        }
        $json_data = json_encode($requestAll, JSON_UNESCAPED_UNICODE);


        // Lưu vào cơ sở dữ liệu

        $userRequest = UserRequests::create([
            'request_name' => $requestName,
            'category_id' => $categoryId,
            'id_user' => $request->id_user,
            'request_template' => $request->id_template,
            'content_request' => $json_data,
        ]);

        if ($request->input('follower')) {
            $followerValue = $request->input('follower');
            try {
                UserRequestsApprover::create([
                    'user_id' => $followerValue,
                    'id_request' => $userRequest->id,
                ]);
            } catch (\Throwable $th) {
                throw $th;
            }
        }
        $newlyCreatedId = $userRequest->id;
        return response()->json(['status' => true, 'id' => $newlyCreatedId,]);
    }
    public function update(Request $request)
    {
        $requestAll = $request->all();
        $id_request = $requestAll['id'];
        $requestDetail = UserRequests::find($id_request);

        $requestName = $requestAll['request_name'];
        $requestContentOriginal = $requestDetail['content_request'];
        unset($requestAll['request_name']);

        // Xử lý file
        if ($request->allFiles()) {
            $allFiles = $request->allFiles();

            // Xử lý tất cả các file và lấy kết quả trả về
            $fileResult = HelperFunctions::handleUploadsFiles($allFiles);

            // Gán kết quả vào $requestAll với đúng key
            foreach ($fileResult as $name_input => $fileData) {
                $requestAll[$name_input] = $fileData;
            }
        }

        $arrayOriginal = json_decode($requestContentOriginal, true);

        // Xóa các key dư thừa trong $requestAll không có trong $arrayOriginal
        foreach (array_keys($requestAll) as $key) {
            if (!array_key_exists($key, $arrayOriginal)) {
                unset($requestAll[$key]);
            }
        }

        // Cập nhật các giá trị từ $requestAll vào $arrayOriginal nếu có sự thay đổi
        foreach ($requestAll as $key => $value) {
            if (is_array($value) && isset($arrayOriginal[$key]) && is_array($arrayOriginal[$key])) {
                $arrayOriginal[$key] = array_merge($arrayOriginal[$key], $value);
            } else {
                $arrayOriginal[$key] = $value;
            }
        }

        // Kết quả sau khi cập nhật
        $json_data = json_encode($arrayOriginal, JSON_UNESCAPED_UNICODE);

        // Lưu vào cơ sở dữ liệu
        $requestDetail->update([
            'request_name' => $requestName,
            'content_request' => $json_data,
        ]);

        return response()->json(['status' => true]);
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
