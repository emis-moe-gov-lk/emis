<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('teacher_timetable_configs')) {
            return;
        }

        Schema::create('teacher_timetable_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->unique()->constrained('teachers')->cascadeOnDelete();
            $table->time('day_start_time');
            $table->time('day_end_time');
            $table->unsignedTinyInteger('num_periods');
            $table->json('off_days')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_timetable_configs');
    }
};
