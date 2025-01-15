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
        Schema::table('users', function (Blueprint $table) {
            // Drop the existing foreign key constraint first
            $table->dropForeign(['department']);

            // Recreate the foreign key with the desired onDelete behavior
            $table->foreign('department')
                ->references('id')
                ->on('departments')
                ->onDelete('set null'); // Change behavior here
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Rollback: drop the modified foreign key
            $table->dropForeign(['department']);

            // Restore the original constraint (optional: update this based on your old config)
        });
    }
};
