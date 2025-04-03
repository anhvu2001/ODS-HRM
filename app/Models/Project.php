<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;
    protected static function boot()
    {
        parent::boot();
        // cascade delete
        static::deleting(function (Project $project) {
            // delete project participants relationship
            if ($project->participants->isNotEmpty()) {
                foreach ($project->participants as $participant) {
                    $participant->delete();
                }
            }
            // delete project tasks relationship
            if ($project->tasks->isNotEmpty()) {
                foreach ($project->tasks as $task) {
                    $task->delete();
                }
            }
        });
    }
    protected $table = 'projects';
    // Xác định các cột có thể được gán giá trị
    protected $fillable = ['name', 'description', 'created_by', 'start_date', 'end_date', 'status_id'];

    // Quan hệ với bảng User (người tạo dự án)
    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    // Quan hệ với bảng Status (trạng thái dự án)
    public function status()
    {
        return $this->belongsTo(Status::class, 'status_id');
    }
    // Phương thức quan hệ đến bảng ProjectParticipant
    public function participants()
    {
        return $this->hasMany(ProjectParticipant::class, 'project_id');
    }
    public function tasks()
    {
        return $this->hasMany(Task::class, "project_id")->orderBy('lft');
    }
}
