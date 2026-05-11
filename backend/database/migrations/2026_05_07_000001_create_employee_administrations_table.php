<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_administrations', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_id', 20)->index();
            $table->string('employee_id', 20)->index();
            $table->string('recruitment_category_id', 12)->nullable();
            $table->string('recruitment_subject_id', 12)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_administrations');
    }
};
