<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRequestApprovalTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('request_approval', function (Blueprint $table) {
            $table->id(); // Tạo cột id tự tăng
            $table->unsignedBigInteger('request_id'); // Khóa ngoại đến bảng user_requests
            $table->unsignedBigInteger('user_id'); // Khóa ngoại đến bảng users
            $table->tinyInteger('order');
            $table->tinyInteger('status')->default(0); // Cột status dạng 0, 1, 2
            $table->timestamps(); // Tạo cột created_at và updated_at tự động   
            // Khóa ngoại
            $table->foreign('request_id')->references('id')->on('user_requests')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('request_approval');
    }
}
