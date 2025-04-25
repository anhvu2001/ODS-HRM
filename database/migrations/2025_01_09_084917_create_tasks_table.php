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
            $table->foreignId("next_assignee_id")->constrained('users')->nullable();
            $table->boolean('status')->nullable();
            $table->unsignedBigInteger("category_id");
            $table->integer("status_id");
            $table->integer('step_order');
            $table->unsignedBigInteger('created_by'); // ID người tạo
            $table->boolean('qc_status')->nullable();
            $table->date('due_date')->nullable(); // Hạn hoàn thành
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->timestamps(); // created_at và updated_at
            $table->softDeletes();

            // Khóa ngoại
            $table->foreign('parent_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
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
