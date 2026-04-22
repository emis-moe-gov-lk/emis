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
        Schema::create('workplaces', function (Blueprint $table) {
            $table->id();
            $table->string('workplace_id', 10)->unique(); // Unique code for the workplace
            $table->string('office_level_id', 10); // Code of the education office/school level
            $table->string('parent_workplace_id', 10)->nullable(); // Code of the parent workplace
            //$table->string('office_name'); // Name of the workplace
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();

            // Indexes for SPEED
            $table->index('office_level_id');
            $table->index('parent_workplace_id');
            $table->index('workplace_id'); // although unique, extra index helps FK joins   

            $table->foreign('office_level_id')->references('office_level_id')->on('office_levels')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workplaces');
    }
};
