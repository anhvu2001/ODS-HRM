<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
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
    // dvh 11/02/2025
    public function tasks()
    {
        return $this->hasMany(Task::class, "project_id")->orderBy('lft');
    }
}
