<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
        'birthday',
        'phone',
        'direct_manager',
        'role',
        'role_code',
        'department'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    public function userTemplates()
    {
        // return $this->belongsToMany(UserTemplate::class)->withPivot('order')->withTimestamps();
    }
    public function directManager()
    {
        return $this->belongsTo(User::class, 'direct_manager');
    }
    // public function departmentModel()
    // {
    //     return $this->belongsTo(Department::class, "department");
    // }
    public function department()
    {
        return $this->hasMany(UserDepartment::class, 'user_id')->with('department');
    }
    public function userDepartment()
    {
        return $this->hasMany(UserDepartment::class, 'user_id');
    }
    public function departmentIds()
    {
        return $this->userDepartment()->pluck('department_id');
    }
    public function isDepartment($departmentId)
    {
        $departments = $this->departmentIds()->toArray();
        return in_array($departmentId, $departments);
    }
    public function TaskComment()
    {
        return $this->hasMany(TaskComment::class, "task_id");
    }
}
