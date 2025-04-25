<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->timestamps();
        });
        DB::table("task_statuses")->insert(
            [
                ['name' => 'Khởi Tạo', 'description' => 'Tạo mới task'],
                ['name' => 'Leader Content Assign', 'description' => 'Leader content gán người thực thi'],
                ['name' => 'Member Content Đang Làm', 'description' => 'Member content làm và cập nhật trạng thái task'],
                ['name' => 'Leader Content QC', 'description' => 'Leader content QC task của member content'],
                ['name' => 'Leader Design Assign', 'description' => 'Leader design gán người thực thi'],
                ['name' => 'Member Design Đang Làm', 'description' => 'Member design làm và cập nhật trạng thái task'],
                ['name' => 'Leader Design QC', 'description' => 'Leader design QC task của member design'],
                ['name' => 'Account Gửi Khách', 'description' => 'Account gửi khách xem'],
                ['name' => 'Hoàn Thành', 'description' => 'Hoàn thành task'],
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_statuses');
    }
};
