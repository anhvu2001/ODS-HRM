<?php

namespace App\Http\Middleware;

use App\Models\Department;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class checkAccountLeader
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $cur_user_id = auth()->id();
        $account_department = Department::find(3);
        $manager = $account_department->manager;
        if (!$account_department) {
            abort(404, 'Phòng ban không tồn tại');
        }
        if ($cur_user_id !== $manager) {
            abort(403, 'bạn không có quyền xem trang này');
        }
        return $next($request);
    }
}
