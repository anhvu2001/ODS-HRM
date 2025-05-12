<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use App\Models\UserDepartment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    //
    public function index()
    {
        $departments = Department::all();
        $user = auth()->user();
        $users = User::all();
        return Inertia::render('Departments/Departments', ['user' => $user, 'departments' => $departments, 'allusers' => $users]);
    }
    public function create(Request $request)
    {
        $department = Department::create(
            [
                "department_name" => $request->department_name,
                "manager" => $request->manager,
            ]
        );
        $leaderDepartmentRelationship = UserDepartment::create([
            'user_id' => $request->manager,
            'department_id' => $department['id'],
            'role_code' => "leader"
        ]);
        // if ($request->manager) {
        //     $user = User::find($request->manager);
        //     $user->update(
        //         [
        //             'department' => $department->id,
        //         ]
        //     );
        // }
        return redirect()->route("Departments");
    }
    public function view($id)
    {
        $department = Department::findOrFail($id);
        $cur_user = auth()->user();
        $departmentMember = UserDepartment::where('department_id', $id)->pluck('user_id');
        // $users = User::whereNotIn('id', $departmentMember)->get();
        $users = User::all();

        $manager = $users->firstWhere('id', $department->manager);
        return Inertia::render('Departments/Department_detail', ["department" => $department, "manager" => $manager, "users" => $users]);
    }
    public function update(Request $request, $id)
    {
        $department = Department::find($id);
        $newManagerId = $request->manager;
        $newManager = User::find($newManagerId);
        // xóa manager của department cũ nếu manager mới đang thuộc một phòng ban 
        // if ($newManager) {
        //     if ($newManager->department) {
        //         $oldDepartment = $newManager->departmentModel;
        //         $oldDepartment->update([
        //             'manager' => null,
        //         ]);
        //     }
        // }
        // đổi thông tin department 
        $department->update(
            [
                'department_name' => $request->department_name,
                'manager' => $newManagerId,
            ]
        );

        // if ($newManager) {
        //     $newManager->update(
        //         [
        //             'department' => $department->id,
        //         ]
        //     );
        // }
        // sửa lại role của manager cũ thành member ở bảng UserDepartment
        $previousDepartmentManager = UserDepartment::where('department_id', $id)
            ->where('role_code', "leader")
            ->first();
        // return response()->json(['message' => $previousDepartmentManager]);
        if ($previousDepartmentManager) {
            $previousDepartmentManager->role_code = "user";
            $previousDepartmentManager->save();
        }

        // sửa role code của manager mới
        $newDepartmentManager = UserDepartment::where('department_id', $id)->where('user_id', $newManagerId)->first();
        if ($newDepartmentManager) {
            $newDepartmentManager->role_code = "leader";
            $newDepartmentManager->save();
        } else {
            UserDepartment::create([
                'department_id' => $id,
                'user_id' => $newManagerId,
                'role_code' => 'leader'
            ]);
        }
        return redirect()->route('Detail_departments', $id);
    }
    public function delete(Request $request)
    {
        $id = $request->id;
        Department::find($id)->delete();
    }
    public function getAllDepartments()
    {
        $departments = Department::select('id', 'department_name')->get();
        $user = User::all();
        return response()->json([
            'success' => true,
            'data' =>  $departments,
            'message' => 'Fetched all department successfully',
        ]);
    }
}
