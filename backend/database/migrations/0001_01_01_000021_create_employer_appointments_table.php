<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employer_appointments', function (Blueprint $table) {

            // Primary Key
            $table->id();

            // Appointment ID
            $table->char('appointment_id', 12)->unique()->index();

            // Applicant / Employee
            $table->char('employee_id', 12)->index();

            // Appointment Details
            $table->date('first_appointment_date');
            $table->date('retirement_date');
            $table->date('resign_date')->nullable();

            // Service Information
            $table->char('service_id', 20)->index()->comment('Service ID from services table');
            $table->char('rank_id', 20)->index()->comment('Rank from service_ranks table');
            $table->char('position_id', 10)->index()->comment('Position ID from positions table');
            $table->char('office_level_id', 10)->index()->comment('Office level ID from office_levels table');
            $table->char('workplace_id', 20)->index()->comment('Primary workplace ID');

            // Documentation
            $table->string('appointment_letter_no')->nullable();
            $table->string('appointment_letter')->nullable(); // file path

            // Numbers
            $table->char('w_op_no', 10)->nullable()->index()->comment('W & OP number');
            $table->char('pay_sheet_no', 10)->nullable()->index()->comment('Pay sheet number');

            // Verification
            $table->boolean('is_verified')->default(false)->comment('true = Verified, false = Not Verified');
            $table->char('verified_by', 12)->nullable()->index()->comment('People ID of verifier');
            $table->dateTime('verified_date')->nullable();

            // Confirmation
            $table->boolean('is_confirmed')->default(false)->comment('true = Confirmed, false = Not Confirmed');
            $table->char('confirmed_by', 12)->nullable()->index()->comment('People ID of confirmer');
            $table->dateTime('confirmed_date')->nullable();

            // Status
            $table->boolean('active_status')->default(true)->comment('true = Active, false = Inactive');

            // Audit Fields
            $table->char('created_by', 12)->nullable();
            $table->char('updated_by', 12)->nullable();

            $table->timestamps();

            // Fast filtering for dashboards & joins
            $table->index(['employee_id', 'service_id', 'active_status'], 'idx_emp_service_active');

            // Fast ZEO / institution-based queries
            $table->index(['workplace_id', 'service_id', 'office_level_id'], 'idx_workplace_service_level');

            // Composite unique constraint (employee can have only one service entry)
            $table->unique(['service_id', 'employee_id'], 'uniq_employee_service_active');

            // Foreign Keys
            $table->foreign('employee_id')->references('people_id')->on('people')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('office_level_id')->references('office_level_id')->on('office_levels')->cascadeOnDelete()->cascadeOnUpdate();

            // $table->foreign('workplace_id')->references('workplace_id')->on('workplaces')->cascadeOnDelete()->cascadeOnUpdate(); // enable if needed

            $table->foreign('rank_id')->references('rank_id')->on('service_ranks')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('service_id')->references('service_id')->on('services')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('position_id')->references('position_id')->on('positions')->cascadeOnDelete()->cascadeOnUpdate();

            // Audit foreign keys
            $table->foreign('created_by')->references('people_id')->on('people');
            $table->foreign('updated_by')->references('people_id')->on('people');
            $table->foreign('confirmed_by')->references('people_id')->on('people');
            $table->foreign('verified_by')->references('people_id')->on('people');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employer_appointments');
    }
};
