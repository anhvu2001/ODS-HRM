<?php

namespace App\Http\Controllers;

use App\Models\UserDepartment;
use Illuminate\Http\Request;

class UserDepartmentsController extends Controller
{
    //
    public function addDepartment(Request $request, $id)
    {
        // department id and user id 
        $isExisted = UserDepartment::where('user_id', $id)->where('department_id', $request->department_id)->first();
        if ($isExisted) {
            abort(403, 'Người dùng đã tồn tại trong phòng ban');
        }
        $newUserDepartment = UserDepartment::create([
            'user_id' => $id,
            'department_id' => $request->department_id
        ]);
    }
    public function getMember(Request $request, $id)
    {
        $departmentMembers = UserDepartment::where('department_id', $id)->with('member')
            ->get()->pluck('member')
            ->map(function ($member) {
                return [
                    'id' => $member['id'],
                    'name' => $member['name']
                ];
            });
        // $formatData = $departmentMembers->map(function ($departmentMember) {
        //     return [
        //         $departmentMember['member']
        //     ];
        // });
        return response()->json($departmentMembers);
    }
    public function removeMember(Request $request)
    {
        $memberDepartment = UserDepartment::where('department_id', $request->department_id)->where('user_id', $request->member_id)->delete();
        if ($memberDepartment) {
            return response()->json(['message' => 'Xóa thành công']);
        } else {
            return response()->json(['message' => 'Xóa thất bại không tồn tại người dùng trong phòng ban này']);
        }
    }
    public function getUserDepartments()
    {
        $user = auth()->user();
        $userDepartments = UserDepartment::where('user_id', $user['id'])->pluck('department_id');
        if ($userDepartments) {
            return response()->json(['departments' => $userDepartments]);
        }
    }
}
