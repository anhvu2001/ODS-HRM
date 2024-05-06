<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestTemplate extends Model
{
    use HasFactory;
    protected $table = 'request_templates';
    
    protected $fillable = [
        'template_name',
        'request_form',
        'flow_of_approvers'
    ];
}
