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
        Schema::create('institutional_facilities', function (Blueprint $table) {
            $table->id();
            $table->string('facilities_id')->unique()->index()->comment('Facilities ID');
            $table->string('name')->comment('Facilities Name');
            $table->string('description')->nullable()->comment('Facilities Description');
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institutional_facilities');
    }
};
