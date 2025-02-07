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
        Schema::create('project_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
        // Thêm các giá trị mặc định vào bảng 'priority_levels'
        DB::table('project_roles')->insert([
            ['name' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Participant', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Executor', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Viewer', 'created_at' => now(), 'updated_at' => now()],

        ]);
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_roles');
    }
};
