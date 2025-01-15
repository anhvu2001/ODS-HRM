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
        Schema::table('departments', function (Blueprint $table) {
            // Add the 'manager' column (nullable BIGINT to match employee_id)
            if (!Schema::hasColumn('departments', 'manager')) {
                $table->unsignedBigInteger('manager')->nullable();
            }
            // Add the foreign key constraint
            $table->foreign('manager')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
