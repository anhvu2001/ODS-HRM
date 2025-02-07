<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectFile extends Model
{
    use HasFactory;
    protected $table = 'project_files';
    protected $fillable = [
        'task_id',
        'project_id',
        'file_name',
        'file_path',
        'uploaded_by',
        'uploaded_at',
        'updated_at',
    ];

    // Liên kết đến bảng tasks
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    // Liên kết đến bảng projects
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Liên kết đến bảng users
    public function user()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
