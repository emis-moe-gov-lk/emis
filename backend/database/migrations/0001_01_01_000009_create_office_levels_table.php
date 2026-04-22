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
        Schema::create('office_levels', function (Blueprint $table) {
            $table->id();
            $table->char('office_level_id', 10)->unique()->comment('e.g., OLID01, OLID02, etc.');
            $table->integer('office_level_rank')->comment('1 for the highest level, increasing with lower levels');
            $table->string('office_level_name', 100)->comment('e.g., school, divisional education office, zonal education office, provincial education office, ministry');
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('office_levels');
    }
};
