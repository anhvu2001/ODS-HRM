<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('input_details', function (Blueprint $table) {
            $table->unsignedBigInteger('id_request_templates');

            // Tạo khóa ngoại
            $table->foreign('id_request_templates')->references('id')->on('request_templates');
        });
    }

    public function down()
    {
        Schema::table('input_details', function (Blueprint $table) {
            // Xóa khóa ngoại nếu cần
            $table->dropForeign(['id_request_templates']);
            $table->dropColumn('id_request_templates');
        });
    }
};
