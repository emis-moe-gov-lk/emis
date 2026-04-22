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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_id', 12)->unique()->index();
            $table->string('employee_id', 12)->index();
            $table->char('teacher_category', 10)->comment('e.g., TCHTYPE001, TCHTYPE002, get from teacher categorys table');
            $table->char('teacher_type', 10)->comment('e.g., TCHTYPE001, TCHTYPE002, get from teacher_types table');
            $table->char('appointment_medium', 10)->comment('e.g., SUB001, SUB002, get from subjects table');
            $table->char('appointment_subject', 10)->comment('e.g., SUB001, SUB002, get from subjects table');
            $table->char('main_subject', 10)->comment('e.g., SUB001, SUB002, get from subjects table');
            $table->char('secondary_subject', 10)->nullable()->comment('e.g., SUB001, SUB002, get from subjects table');
            $table->char('current_teaching_subject', 10)->comment('e.g., SUB001, SUB002, get from subjects table');
            $table->string('created_by', 12)->nullable()->index();
            $table->string('updated_by', 12)->nullable()->index();
            $table->timestamps();

            $table->foreign('appointment_id')->references('appointment_id')->on('employer_appointments')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('employee_id')->references('people_id')->on('people')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('teacher_category')->references('categories_id')->on('teacher_categories')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('teacher_type')->references('teacher_types_id')->on('teacher_types')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('appointment_medium')->references('medium_id')->on('medium_of_instructions')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('appointment_subject')->references('a_subject_id')->on('apointed_subjects')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('main_subject')->references('subject_id')->on('subject_lists')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('secondary_subject')->references('subject_id')->on('subject_lists')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('current_teaching_subject')->references('subject_id')->on('subject_lists')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('created_by')->references('people_id')->on('people');
            $table->foreign('updated_by')->references('people_id')->on('people');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
