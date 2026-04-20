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
        Schema::create('citylists', function (Blueprint $table) {
            $table->id();
            $table->string('city_id',10)->unique();
            $table->string('district_id',10);
            $table->string('city_name_en',50);
            $table->string('city_name_si',50)->nullable();
            $table->string('city_name_ta',50)->nullable();
            $table->string('postcode',10);
            $table->string('latitude',10)->nullable();
            $table->string('longitude',10)->nullable();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('district_id')->references('district_id')->on('districts_lists')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citylists');
    }
};
