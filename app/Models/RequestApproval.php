<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestApproval extends Model
{
    use HasFactory;
    protected $table = 'request_approval';
    protected $fillable = [
        'request_id',
        'user_id',
        'status',
        'order'
    ];
}
