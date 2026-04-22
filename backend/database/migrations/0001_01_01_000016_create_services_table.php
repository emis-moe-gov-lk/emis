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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->char('service_id', 10)->unique()->comment('e.g., POS001, POS002');
            $table->string('service_name')->unique()->comment('e.g., Teacher, Principal, Admin Officer');
            $table->string('description')->nullable();
            $table->unsignedSmallInteger('rank')->nullable();
            $table->boolean('is_gov_service')->default(true)->comment('true: Gov Service, false: System Service');
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
