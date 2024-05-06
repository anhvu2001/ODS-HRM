<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::table('input_details', function (Blueprint $table) {
            $table->unsignedInteger('priority')->default(99);
        });
    }

    public function down()
    {
        Schema::table('input_details', function (Blueprint $table) {
            $table->dropColumn('priority');
        });
    }

};
