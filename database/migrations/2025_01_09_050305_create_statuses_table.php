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
        Schema::create('statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Cột tên trạng thái
            $table->timestamps();
        });

        // Chèn dữ liệu mẫu vào bảng 'statuses'
        DB::table('statuses')->insert([
            ['name' => 'Not Started', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'In Progress', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Completed', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Pending', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Canceled', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statuses');
    }
};
