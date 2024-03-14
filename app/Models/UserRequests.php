<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRequests extends Model
{
    use HasFactory;
    protected $table = 'user_requests';
    protected $fillable = [
        'request_name',
        'request_template',
        'category_id',
        'content_request',
        'status',
        'flow_approvers',
        'id_user',
    ];
}
