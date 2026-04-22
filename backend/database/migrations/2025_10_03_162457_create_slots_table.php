<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teacher_timetable_configs')->onDelete('cascade');
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
            $table->foreignId('period_id')->constrained('periods')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->string('class_name', 50);
            $table->integer('students')->default(0);
            $table->timestamps();

            // Prevent double-booking same period on same day for a teacher
            $table->unique(['teacher_id', 'day', 'period_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slots');
    }
};
