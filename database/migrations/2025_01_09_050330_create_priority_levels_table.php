<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('priority_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Cột tên độ ưu tiên
            $table->timestamps();
        });
        // Thêm các giá trị mặc định vào bảng 'priority_levels'
        DB::table('priority_levels')->insert([
            ['name' => 'High', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Low', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Medium', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('priority_levels');
    }
};
