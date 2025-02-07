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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id(); // ID tự tăng
            $table->unsignedBigInteger('parent_id')->nullable(); // Task cha
            $table->unsignedBigInteger('project_id'); // ID dự án
            $table->string('name'); // Tên task
            $table->text('description')->nullable(); // Mô tả task
            $table->unsignedBigInteger('created_by'); // ID người tạo
            $table->unsignedBigInteger('status_id'); // ID trạng thái
            $table->unsignedBigInteger('priority_id'); // ID độ ưu tiên
            $table->date('start_date')->nullable(); // Ngày bắt đầu
            $table->date('due_date')->nullable(); // Hạn hoàn thành
            $table->unsignedInteger('lft')->nullable(); // Vị trí bên trái trong cây
            $table->unsignedInteger('rgt')->nullable(); // Vị trí bên phải trong cây
            $table->unsignedInteger('depth')->nullable(); // Độ sâu của node trong cây
            $table->timestamps(); // created_at và updated_at
            $table->softDeletes(); 

            // Khóa ngoại
            $table->foreign('parent_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('status_id')->references('id')->on('statuses')->onDelete('cascade');
            $table->foreign('priority_id')->references('id')->on('priority_levels')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
