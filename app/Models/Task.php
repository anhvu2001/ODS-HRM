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
        SoftDeletes;
    protected $table = 'tasks';

    protected $fillable = [
        'parent_id',
        'project_id',
        'name',
        'description',
        'next_assignee_id',
        'status',
        'category_id',
        'step_id',
        'step_order',
        'created_by',
        'due_date',
        'qc_status',
        'department_id',
        'qc_note',
        'parent_task_id',
        'task_step_flow',
        'feedback'
    ];

    // Liên kết đến task cha
    protected static function boot()
    {
        parent::boot();
        // cascading delete
        static::deleting(function (Task $task) {
            // delete task comments relationship
            if ($task->taskComments->isNotEmpty()) {
                foreach ($task->taskComments as $comment) {
                    $comment->delete();
                }
            }

            // delete sub-tasks
            if ($task->children->isNotEmpty()) {
                foreach ($task->children as $child) {
                    $child->delete();
                }
            }
            // delete task project file relationship
            if ($task->projectFiles->isNotEmpty()) {
                foreach ($task->projectFiles as $file) {
                    $file->delete();
                }
            }
        });
    }
    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    // // Liên kết đến các task con
    public function children()
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    public function directChildren()
    {
        return $this->hasOne(Task::class, 'parent_id');
    }

    // Liên kết đến người tạo
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Liên kết đến trạng thái
    // public function status()
    // {
    //     return $this->belongsTo(Status::class, 'step_id');
    // }

    // Liên kết đến độ ưu tiên
    // public function priority()
    // {
    //     return $this->belongsTo(PriorityLevel::class, 'priority_id');
    // }
    // Phương thức này nếu cần tùy chỉnh các trường lưu vào audit
    public function getAuditData()
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'step_id' => $this->step_id,
        ];
    }
    // dvh 11/02/2025
    public function project()
    {
        return $this->belongsTo(Project::class, "project_id");
    }
    // lấy cột lft trong database làm left
    // public function getLftName()
    // {
    //     return 'lft';  // Change _lft to lft
    // }
    // // lấy cột rgt trong database làm right
    // public function getRgtName()
    // {
    //     return 'rgt';  // Change _rgt to rgt
    // }
    // lấy cột parent_id làm parent 
    // public function getParentIdName()
    // {
    //     return 'parent_id';
    // }
    // public function taskUser()
    // {
    //     return $this->hasOne(TaskUser::class, "task_id");
    // }
    public function taskComments()
    {
        return $this->hasMany(TaskComment::class, "task_id");
    }
    public function projectFiles()
    {
        return $this->hasMany(ProjectFile::class, "task_id");
    }
    public function department()
    {
        return $this->belongsTo(Department::class, "department_id");
    }
    public function category()
    {
        return $this->belongsTo(TaskCategory::class, "category_id");
    }
    public function assignee()
    {
        return $this->belongsTo(User::class, 'next_assignee_id');
    }
    public function statusDetails()
    {
        return $this->belongsTo(StatusDetails::class, 'status');
    }
    public function stepDetail()
    {
        return $this->belongsTo(StepDetail::class, 'step_id');
    }
    // public function findFirstTaskByDepartmentRecursive($department)
    // {
    //     //
    //     $parent = $this->parent;
    //     if (!$parent) {
    //         return null;
    //     }
    //     $parent_department = $parent['department_id'];
    //     if ($parent_department !== $department) {
    //         return $parent->findFirstTaskByDepartmentRecursive($department);
    //     } else {
    //         return $parent->parent;
    //     }
    //     // $parent_assignee=$parent->assignee();
    // }
}
