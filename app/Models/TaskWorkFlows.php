<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskWorkFlows extends Model
{
    use HasFactory;
    protected $table = "task_workflows";
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
