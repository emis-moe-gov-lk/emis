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
        Schema::create('people_education_qualifications', function (Blueprint $table) {
            $table->id();
            $table->string('people_id', 12)->comment('Foreign key referencing pepole list table');
            $table->char('qualifications_id', 10);
            $table->char('institution');
            $table->date('effective_date');
            $table->string('grade', 10);
            $table->char('description')->nullable();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->string('created_by', 12)->nullable();
            $table->string('updated_by', 12)->nullable();
            $table->timestamps();

            $table->foreign('people_id')->references('people_id')->on('people')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('qualifications_id')->references('qualifications_id')->on('education_qualifications')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('grade')->references('grade_id')->on('educational_qualification_grades')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('created_by')->references('people_id')->on('people');
            $table->foreign('updated_by')->references('people_id')->on('people');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('people_education_qualifications');
    }
};
