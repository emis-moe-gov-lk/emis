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
        Schema::create('family_members', function (Blueprint $table) {
            $table->id();
            $table->char('family_id', 12)->comment('FK → families.family_id');
            $table->string('child_name')->comment('Children name');
            $table->date('date_of_birth')->comment('Children birth day');
            $table->char('gender_id', 3)->comment('Foreign key referencing gender list table');
            $table->string('birth_fc_no', 12)->comment('Children birth certificate number');
            $table->boolean('health_condition')->default(true)->comment('true: Normal, false: Special Needs');
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->string('created_by', 12)->nullable();
            $table->string('updated_by', 12)->nullable();

            $table->timestamps();

            $table->foreign('family_id')->references('family_id')->on('families')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('gender_id')->references('gender_id')->on('gender_lists')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('created_by')->references('people_id')->on('people');
            $table->foreign('updated_by')->references('people_id')->on('people');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_members');
    }
};
