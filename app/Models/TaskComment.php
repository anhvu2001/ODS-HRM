<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Kalnoy\Nestedset\NodeTrait;

class TaskComment extends Model
{
    use HasFactory,
        SoftDeletes,
        NodeTrait;
    protected $fillable = [
        'user_id',
        'task_id',
        'content',
        '_lft',
        '_rgt',
        'parent_id',
        'file_paths',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
    public function parent()
    {
        return $this->belongsTo(TaskComment::class, 'parent_id');
    }
}
