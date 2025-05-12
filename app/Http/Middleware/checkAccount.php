<?php

namespace App\Http\Middleware;

use App\Models\Department;
use App\Models\UserDepartment;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use function PHPUnit\Framework\isEmpty;

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
        $isAccount = UserDepartment::where('user_id', auth()->id())
            ->where('department_id', 3)->first();

        if (!$account_department) {
            abort(404, 'Phòng account không tồn tại');
        }
        if (!isEmpty($isAccount)) {
            // abort(404,  $isAccount);
            abort(404, 'Bạn không thuộc phòng account');
        }
        return $next($request);
    }
}
