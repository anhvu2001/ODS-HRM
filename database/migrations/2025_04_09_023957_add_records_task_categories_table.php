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
        //
        DB::table('task_categories')->insert([
            ['name' => 'Post Hình', 'parent_id' => null, 'created_at' => now()],
            ['name' => 'Post Video', "parent_id" => null, 'created_at' => now()],
            ['name' => 'Content Calender', 'parent_id' => null, 'created_at' => now()],
            ['name' => 'Brief', 'parent_id' => json_encode(['id' => [1, 2]]), 'created_at' => now()],
            ['name' => 'Post Caption', 'parent_id' => json_encode(['id' => [1, 2]]), 'created_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
