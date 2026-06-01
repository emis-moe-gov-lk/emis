<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('teacher_holidays')) {
            return;
        }

        Schema::create('teacher_holidays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teacher_timetable_configs')->cascadeOnDelete();
            $table->date('date');
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->unique(['teacher_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_holidays');
    }
};
