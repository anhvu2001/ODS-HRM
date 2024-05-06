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
        Schema::create('request_templates', function (Blueprint $table) {
            $table->id();
            $table->string('template_name');
            $table->json('request_form');
            $table->json('flow_of_approvers');
            $table->timestamps(); // Tự động tạo 'created_at' và 'updated_at'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_templates');
    }
};
