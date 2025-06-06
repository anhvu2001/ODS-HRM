<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StepDetail extends Model
{
    use HasFactory;
    protected $table = 'step_detail';
    protected $fillable = [
        'name',
        'description'
    ];
}
