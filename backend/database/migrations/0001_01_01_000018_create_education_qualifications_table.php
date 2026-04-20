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
        Schema::create('education_qualifications', function (Blueprint $table) {
            $table->id();
            $table->char('qualifications_id', 10)->unique();
            $table->smallInteger('rank')->nullable();
            $table->string('slql', 10)->nullable()->comment('Sri Lanka Qualifications Framework Leve');
            $table->string('nvql', 10)->nullable()->comment('National Vocational Qualification Level');
            $table->string('qualification');
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_qualifications');
    }
};
