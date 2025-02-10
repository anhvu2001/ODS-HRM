<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;
    protected $table = 'comments';
    protected $fillable = [
        'content',
        'user_id',
        'request_id',
        'parent_comment_id',
        'level',
        'file_path',
    ];
}
