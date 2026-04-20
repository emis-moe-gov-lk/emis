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
        Schema::create('families', function (Blueprint $table) {
            $table->id();
            $table->char('family_id', 12)->unique();
            $table->char('member_a_id', 12)->comment('FK → people table');
            $table->char('member_b_id', 12)->comment('FK → people table');
            $table->date('married_date', 12)->comment('Married date');
            $table->string('married_cf_no', 12)->nullable()->comment('marriage certificate number');
            $table->string('married_cf', 12)->nullable()->comment('marriage certificate');
            $table->date('divorce_date', 12)->nullable()->comment('Divorce date');
            $table->string('family_name')->nullable()->comment('Optional family label or household name');
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->string('created_by', 12)->nullable();
            $table->string('updated_by', 12)->nullable();
            $table->timestamps();

            // Prevent same husband-wife pair duplicates
            $table->unique(['member_a_id', 'member_b_id']);

            $table->foreign('member_a_id')->references('people_id')->on('people')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('member_b_id')->references('people_id')->on('people')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('created_by')->references('people_id')->on('people');
            $table->foreign('updated_by')->references('people_id')->on('people');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('families');
    }
};
