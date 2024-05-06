<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

    class InputDetailRequest extends Model
    {

        protected $table = 'input_details';

        protected $fillable = [
            'input_name',
            'input_type',
            'default_value',
            'input_description',
            'id_request_templates',
            'required'
        ];
    }
