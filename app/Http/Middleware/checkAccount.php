<?php

namespace App\Http\Middleware;

use App\Models\Department;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class checkAccount
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $curUser = auth()->user();
        $account_department = Department::find(3);
        // $manager = $account_department->manager;
        if (!$account_department) {
            abort(404, 'Phòng ban không tồn tại');
        }
        if ($curUser['department'] !== 3) {
            abort(404, 'Bạn không thuộc phòng account');
        }
        return $next($request);
    }
}
