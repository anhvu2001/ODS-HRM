<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveUserTemplateIdFromUserRequestApproverTable extends Migration
{
    public function up()
    {
        Schema::table('user_request_approver', function (Blueprint $table) {
            if (Schema::hasColumn('user_request_approver', 'user_template_id')) {
                // Xóa khóa ngoại
                $table->dropForeign(['user_template_id']);
                // Xóa cột 'user_template_id'
                $table->dropColumn('user_template_id');
            }
        });
    }

    public function down()
    {
        Schema::table('user_request_approver', function (Blueprint $table) {
            // Thêm lại cột 'user_template_id'
            $table->unsignedBigInteger('user_template_id');

            // Thêm liên kết khóa ngoại lại
            $table->foreign('user_template_id')->references('id')->on('user_templates');
        });
    }
}

