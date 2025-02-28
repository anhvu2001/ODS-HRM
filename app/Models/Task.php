<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Kalnoy\Nestedset\NodeTrait;
use OwenIt\Auditing\Contracts\Auditable;

class Task extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    use HasFactory,
        NodeTrait,
        SoftDeletes;
    protected $table = 'tasks';

    protected $fillable = [
        'parent_id',
        'project_id',
        'name',
        'description',
        'created_by',
        'status_id',
        'priority_id',
        'start_date',
        'due_date',
        'lft',
        'rgt',
        'depth',
    ];

    // Liên kết đến task cha
    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    // Liên kết đến các task con
    public function children()
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    // Liên kết đến người tạo
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Liên kết đến trạng thái
    public function status()
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    // Liên kết đến độ ưu tiên
    public function priority()
    {
        return $this->belongsTo(PriorityLevel::class, 'priority_id');
    }
    // Phương thức này nếu cần tùy chỉnh các trường lưu vào audit
    public function getAuditData()
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'status_id' => $this->status_id,
        ];
    }
    // dvh 11/02/2025
    public function project()
    {
        return $this->belongsTo(Project::class, "project_id");
    }
    // lấy cột lft trong database làm left
    public function getLftName()
    {
        return 'lft';  // Change _lft to lft
    }
    // lấy cột rgt trong database làm right
    public function getRgtName()
    {
        return 'rgt';  // Change _rgt to rgt
    }
    // lấy cột parent_id làm parent 
    public function getParentIdName()
    {
        return 'parent_id';
    }
    public function taskUser()
    {
        return $this->hasOne(TaskUser::class, "task_id");
    }
    public function taskComments()
    {
        return $this->hasMany(TaskComment::class, "task_id");
    }
}
