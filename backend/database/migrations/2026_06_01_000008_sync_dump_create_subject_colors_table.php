<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('subject_colors')) {
            return;
        }

        Schema::create('subject_colors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teacher_timetable_configs')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->string('color', 7);
            $table->timestamps();

            $table->unique(['teacher_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_colors');
    }
};
