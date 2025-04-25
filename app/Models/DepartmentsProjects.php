<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DepartmentsProjects extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'departments_participate_project';
    protected $fillable = ['project_id', 'department_id'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
