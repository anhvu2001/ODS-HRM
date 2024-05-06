<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_template_user', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_template_id');
            $table->unsignedBigInteger('user_id');
            $table->integer('order')->nullable(); // Thứ tự giữa mỗi lần duyệt
            $table->timestamps();

            // Khóa ngoại đến user_templates
            $table->foreign('user_template_id')->references('id')->on('user_templates')->onDelete('cascade');

            // Khóa ngoại đến users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_template_user');
    }
};
