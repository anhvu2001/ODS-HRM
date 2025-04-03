<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Kalnoy\Nestedset\NestedSet;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->unsignedBigInteger("task_id");
            $table->string("content")->nullable();
            $table->foreign("user_id")->references("id")->on("users")->onDelete("cascade");
            $table->foreign("task_id")->references("id")->on("tasks")->onDelete("cascade");
            $table->nestedSet();
            $table->text('file_paths')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('table', function (Blueprint $table) {
            $table->dropNestedSet();
        });
    }
};
