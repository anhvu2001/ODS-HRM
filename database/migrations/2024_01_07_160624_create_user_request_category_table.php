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
        if (!Schema::hasTable('user_request_category')) {
            Schema::create('user_request_category', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }

        // Add the user_request_category column to the request_templates table
        Schema::table('request_templates', function (Blueprint $table) {
            $table->unsignedBigInteger('user_request_category')->nullable();
            $table->foreign('user_request_category')->references('id')->on('user_request_category');
        });
    }



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_request_category');
    }
};
