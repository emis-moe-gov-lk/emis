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
        Schema::create('education_administrator_services', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_id', 12)->unique()->index();
            $table->string('employee_id', 12)->unique()->index();
            $table->string('category_id', 10)->comment('get from education_administrator_service_categories table');
            $table->string('subject', 10)->comment('get from education_administrator_service_subjects table');

            // Audit (self references)
            $table->string('created_by', 12)->nullable()->index();
            $table->string('updated_by', 12)->nullable()->index();

            $table->timestamps();

            // Foreign keys (non-self)
            $table->foreign('appointment_id')->references('appointment_id')->on('employer_appointments')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('employee_id')->references('people_id')->on('people')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('category_id')->references('category_id')->on('education_administrator_service_categories')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('subject')->references('eas_subject_id')->on('education_administrator_service_subjects')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('created_by')->references('people_id')->on('people');
            $table->foreign('updated_by')->references('people_id')->on('people');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_administrator_services');
    }
};
