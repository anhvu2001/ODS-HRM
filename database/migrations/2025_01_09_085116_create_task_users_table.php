<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_users', function (Blueprint $table) {
            $table->id(); // ID tự tăng
            $table->unsignedBigInteger('task_id'); // ID task
            $table->unsignedBigInteger('user_id'); // ID người thực thi
            $table->unsignedBigInteger('status_id'); // Trạng thái thực thi
            $table->timestamps(); // created_at và updated_at

            // Khóa ngoại
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('status_id')->references('id')->on('statuses')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_users');
    }
};
