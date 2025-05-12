<?php

namespace App\Http\Middleware;

use App\Models\UserDepartment;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckDepartmentRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $userDepartmentRole = UserDepartment::where('user_id', auth()->id())
            ->where('role_code', 'leader')
            ->get();

        if (empty($userDepartmentRole)) {
            return abort(403, 'Bạn không có quyền truy cập trang này.');
        }

        return $next($request);
    }
}
