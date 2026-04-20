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
        Schema::create('employer_current_appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_id', 12)->unique();
            $table->string('employee_id', 12)->unique();
            $table->date('appoint_date');
            $table->string('appointment_letter_no')->nullable()->comment('Appointment letter number');
            $table->char('service_id', 20)->index()->comment('e.g., POS001, POS002, get from position table');
            $table->char('rank_id', 20)->index()->comment('e.g., RANK001, RANK002, get from rank table');
            $table->char('office_level_id', 10)->index()->comment('e.g., OFF001, OFF002');
            $table->string('position_id', 10)->index()->comment('e.g., POS001, POS002, get from position table');
            $table->char('workplace_id', 20)->index()->comment('ID of the primary office');
            $table->string('created_by', 12)->nullable();
            $table->string('updated_by', 12)->nullable();
            $table->timestamps();

            $table->index(
                ['service_id', 'workplace_id', 'employee_id'],
                'idx_eca_service_workplace_employee'
            );

            $table->foreign('appointment_id')->references('appointment_id')->on('employer_appointments')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('employee_id')->references('people_id')->on('people')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('service_id')->references('service_id')->on('services')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('rank_id')->references('rank_id')->on('service_ranks')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('office_level_id')->references('office_level_id')->on('office_levels')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('position_id')->references('position_id')->on('positions')->onDelete('restrict')->onUpdate('cascade');
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
        Schema::dropIfExists('employer_current_appointments');
    }
};
