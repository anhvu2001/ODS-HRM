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
        Schema::table('users', function (Blueprint $table) {
            // Manually drop the FK using raw SQL if Laravel's method fails
            DB::statement('ALTER TABLE `users` DROP FOREIGN KEY `fk_users_department`');

            // Now drop the column using Laravel
            $table->dropForeign('users_department_foreign');
            $table->dropColumn('department');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {}
};
