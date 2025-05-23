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
        //
        Schema::table("tasks", function (Blueprint $table) {
            $table->foreignId("parent_task_id")->nullable()->constrained('tasks')->onDelete('cascade');
            $table->text('task_step_flow')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table("tasks", function (Blueprint $table) {
            $table->dropConstrainedForeignId("parent_task_id");
            $table->dropColumn('task_step_flow');
        });
    }
};
