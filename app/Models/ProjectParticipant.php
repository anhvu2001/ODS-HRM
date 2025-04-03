<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectParticipant extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'project_participants';
    protected $fillable = ['project_id', 'user_id', 'role_id'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function role()
    {
        return $this->belongsTo(ProjectRole::class);
    }
}
