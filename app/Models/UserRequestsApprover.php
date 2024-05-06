<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRequestsApprover extends Model
{
    use HasFactory;
    protected $table = 'user_request_approver';
    protected $fillable = [
        'id',
        'user_id',
        'order',
        'id_request'
    ];
}
