<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Providers\RouteServiceProvider;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index()
    {
        // Retrieve all users from database
        $users = User::with('directManager')->get();
        // Return view with users data
        return Inertia::render('Users/Users', ['users' => $users]);
    }

    public function view($id)
    {
        // Retrieve user data from database using $id
        $user = User::find($id);
        $allLeaderAdmin = User::whereIn('role', ['1', '99'])->get();


        // Return view with user data
        return Inertia::render('Users/Detail_user', [
            'user' => $user,
            'allLeaderAdmin' => $allLeaderAdmin
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $filename = time() . '.' . $avatar->getClientOriginalExtension();
            $avatar->storeAs('public/avatars', $filename);
            $user->avatar = $filename;
        }
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'direct_manager' => $request->direct_manager,
            'role_code' => $request->role_code,

        ]);
        if ($request->password !== null) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }
        return redirect()->route('Detail_users', $user->id);
    }

    public function delete(Request $request)
    {
        $id = $request->id;

        $user = User::find($id);

        // Delete user from database
        $user->delete();

        // Redirect to user list page
        return redirect()->route('Users');
    }
    public function create(Request $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthday'  => $request->birthday,
            'phone' => $request->phone,
            'role' => $request->role,
            'role_code' => $request->role_code,
            'direct_manager' => $request->direct_manager,
        ]);
        return redirect()->route('dashboard');
    }
    public function search(Request $request)
    {
        $keyname = $request->query('name');

        // Tìm kiếm người dùng dựa trên tên
        $users = User::where('name', 'like', "%$keyname%")->get();

        return response()->json($users);
    }
}
