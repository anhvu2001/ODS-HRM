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
        Schema::table('users', function (Blueprint $table) {
            // Add role column if it doesn't already exist
            if (!Schema::hasColumn('users', 'department')) {
                $table->bigInteger('department')->unsigned()->nullable();
            }
            $table->foreign('department', 'fk_users_department')->references('id')->on('departments')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('users', function (Blueprint $table) {
            // Add role column if it doesn't already exist
            $table->unsignedBigInteger('department')->nullable();
            $table->foreign('department')->references('id')->on('departments');
        });
    }
};
