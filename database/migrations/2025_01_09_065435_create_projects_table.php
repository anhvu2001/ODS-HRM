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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tạo cột name lưu tên dự án
            $table->text('description')->nullable(); // Tạo cột description lưu mô tả dự án
            $table->foreignId('created_by')->constrained('users'); // Khóa ngoại tới bảng users, lưu ID người tạo dự án
            $table->date('end_date'); // Tạo cột ngày kết thúc
            $table->timestamps(); // Tạo cột created_at và updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
