<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_templates', function (Blueprint $table) {
            $table->id();
            $table->string('request_name');
            $table->unsignedBigInteger('request_template');
            $table->longText('content_request')->nullable();
            $table->longText('flow_approvers')->nullable();
            $table->timestamps();

            // Tạo khóa ngoại
            $table->foreign('Request_template')->references('id')->on('request_templates');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_templates');
    }
};
