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
        Schema::create('police_stations', function (Blueprint $table) {
            $table->id();
            $table->char('police_station_id', 10)->unique()->comment('example. PSID01, PSID02');
            $table->string('police_station_name', 150)->unique()->comment('Station Name');
            $table->string('address')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('phone', 20)->unique();
            $table->string('email')->unique();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('police_stations');
    }
};
