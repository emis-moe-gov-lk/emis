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
        Schema::create('zonal_education_offices', function (Blueprint $table) {
            $table->id();
            $table->char('workplace_id',10)->unique()->comment('Office ID');
            $table->char('peo_wp_id',10);
            $table->char('district_id',10)->nullable();
            $table->string('name');
            $table->string('short_name',50);
            $table->string('email')->unique()->nullable();
            $table->string('phone', 20)->unique()->nullable();
            $table->string('address')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();  // total 10 digits, 7 after decimal
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();

            $table->foreign('district_id')->references('district_id')->on('districts_lists')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('peo_wp_id')->references('workplace_id')->on('provincial_education_offices')->onDelete('cascade')->onUpdate('cascade');
            //$table->foreign('workplace_id')->references('workplace_id')->on('workplaces')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zonal_education_offices');
    }
};
