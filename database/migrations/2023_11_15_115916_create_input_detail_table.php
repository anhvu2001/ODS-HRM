<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInputDetailTable extends Migration
{
    public function up()
    {
        Schema::create('input_detail', function (Blueprint $table) {
            $table->id();
            $table->string('input_name');
            $table->string('input_type');
            $table->text('input_description')->nullable();
            $table->boolean('required')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('input_detail');
    }
}
