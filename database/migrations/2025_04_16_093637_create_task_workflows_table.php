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
        Schema::create('task_workflows', function (Blueprint $table) {
            $table->id();
            // $table->unsignedBigInteger('category_id');
            $table->foreignId('category_id')->constrained('task_categories');
            $table->integer('step_order');
            // $table->integer('current_step_id');
            // $table->integer('next_step_id');
            $table->foreignId('current_step_id')->constrained('step_detail');
            $table->foreignId('next_step_id')->constrained('step_detail');
            $table->foreignId("department")->nullable()->constrained('departments')->onDelete('set null');
            $table->boolean('is_final_step');
            $table->timestamps();
        });
        DB::table("task_workflows")->insert(
            [
                ['category_id' => 1, 'step_order' => 1, 'current_step_id' => 1, 'next_step_id' => 2, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 1, 'step_order' => 2, 'current_step_id' => 2, 'next_step_id' => 3, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 4, 'step_order' => 1, 'current_step_id' => 3, 'next_step_id' => 4, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 4, 'step_order' => 2, 'current_step_id' => 4, 'next_step_id' => 5, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 4, 'step_order' => 3, 'current_step_id' => 5, 'next_step_id' => 6, 'department' => 2, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 4, 'step_order' => 4, 'current_step_id' => 6, 'next_step_id' => 7, 'department' => 2, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 4, 'step_order' => 5, 'current_step_id' => 7, 'next_step_id' => 8, 'department' => 2, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 4, 'step_order' => 6, 'current_step_id' => 8, 'next_step_id' => 9, 'department' => 3, 'is_final_step' => 1, "created_at" => now()],
                ['category_id' => 2, 'step_order' => 1, 'current_step_id' => 1, 'next_step_id' => 2, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 2, 'step_order' => 2, 'current_step_id' => 2, 'next_step_id' => 3, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 3, 'step_order' => 1, 'current_step_id' => 1, 'next_step_id' => 2, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 3, 'step_order' => 2, 'current_step_id' => 2, 'next_step_id' => 3, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 3, 'step_order' => 3, 'current_step_id' => 3, 'next_step_id' => 4, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 3, 'step_order' => 4, 'current_step_id' => 4, 'next_step_id' => 8, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 3, 'step_order' => 5, 'current_step_id' => 8, 'next_step_id' => 9, 'department' => 3, 'is_final_step' => 1, "created_at" => now()],
                ['category_id' => 5, 'step_order' => 1, 'current_step_id' => 3, 'next_step_id' => 4, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 5, 'step_order' => 2, 'current_step_id' => 4, 'next_step_id' => 8, 'department' => 1, 'is_final_step' => 0, "created_at" => now()],
                ['category_id' => 5, 'step_order' => 3, 'current_step_id' => 8, 'next_step_id' => 9, 'department' => 3, 'is_final_step' => 1, "created_at" => now()],
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_workflows');
    }
};
