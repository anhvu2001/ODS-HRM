<?php

namespace App\Http\Controllers\Requests;

use App\Exports\UserRequestsExport;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ExcelController extends Controller
{
    public function index()
    {
        $userRequests = UserRequests::join('users', 'user_requests.id_user', '=', 'users.id')
            ->join('request_templates', 'user_requests.request_template', '=', 'request_templates.id')
            ->select('user_requests.*', 'users.name as user_name', 'request_templates.template_name', 'request_templates.flow_of_approvers')
            ->orderBy('user_requests.id', 'DESC')
            ->get();
        return Inertia::render('Requests/Export_requests', compact('userRequests'));
    }
    public function filterData(Request $request)
    {
        $categoryId = $request->input('category');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
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
            ->orderBy('user_requests.id', 'DESC')
            ->get();
        return response()->json(["listDataRequest" => $userRequests]);
    }
    public function exportUserRequests(Request $request)
    {
        $categoryId = (int)$request->input('category');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');

        return Excel::download(new UserRequestsExport($categoryId, $startDate, $endDate), 'Users_Request.xlsx');
    }
}
