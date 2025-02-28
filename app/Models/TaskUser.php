<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskUser extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'task_users';
    protected $fillable = [
        'task_id',
        'user_id',
        'status_id',
    ];

    // Liên kết đến Task
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    // Liên kết đến User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Liên kết đến trạng thái thực thi
    public function status()
    {
        return $this->belongsTo(Status::class, 'status_id');
    }
}
