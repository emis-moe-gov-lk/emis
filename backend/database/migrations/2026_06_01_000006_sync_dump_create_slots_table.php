<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('slots')) {
            return;
        }

        Schema::create('slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teacher_timetable_configs')->cascadeOnDelete();
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
            $table->foreignId('period_id')->constrained('periods')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->string('class_name', 50);
            $table->integer('students')->default(0);
            $table->string('purpose', 255)->nullable();
            $table->date('date')->nullable();
            $table->timestamps();

            $table->unique(['teacher_id', 'day', 'period_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slots');
    }
};
