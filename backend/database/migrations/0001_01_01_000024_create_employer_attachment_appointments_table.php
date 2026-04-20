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
        Schema::create('employer_attachment_appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_id', 12)->unique();
            $table->string('employee_id', 12);
            $table->date('appoint_date');
            $table->date('end_date')->nullable();
            $table->string('position_id', 10)->comment('e.g., POS001, POS002, get from position table');
            $table->char('office_level_id', 10)->comment('e.g., OFF001, OFF002');
            $table->char('workplace_id', 20)->comment('ID of the primary office');
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->string('created_by', 12)->nullable();
            $table->string('updated_by', 12)->nullable();
            $table->timestamps();

            $table->foreign('employee_id')->references('people_id')->on('people')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('position_id')->references('position_id')->on('positions')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('office_level_id')->references('office_level_id')->on('office_levels')->onDelete('restrict')->onUpdate('cascade');
            // Note: The 'workplace_id' foreign key constraint is not added here due to its dynamic nature based on 'office_level_id'.
            $table->foreign('created_by')->references('people_id')->on('people');
            $table->foreign('updated_by')->references('people_id')->on('people');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employer_attachment_appointments');
    }
};
