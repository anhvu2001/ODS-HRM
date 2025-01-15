<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;
    protected $table = 'departments';
    protected $fillable = [
        "id",
        "department_name",
        "created_at",
        "updated_at",
        "manager"
    ];
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager');
    }
}
