<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskWorkFlows extends Model
{
    use HasFactory;
    protected $table = "task_workflows";

    protected $fillable = [
        "category_id",
        "step_order",
        "current_step_id",
        "next_step_id",
        "department",
        "is_final_step"
    ];
    public function category()
    {
        return $this->belongsTo(TaskCategory::class, "category_id");
    }
    public function nextStep()
    {
        return $this->belongsTo(StepDetail::class, 'next_step_id');
    }
    public function currentStep()
    {
        return $this->belongsTo(StepDetail::class, 'current_step_id');
    }
    public function currentDepartment()
    {
        return $this->belongsTo(Department::class, 'department');
    }
}
