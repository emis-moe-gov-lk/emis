<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('intervals')) {
            return;
        }

        Schema::create('intervals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teacher_timetable_configs')->cascadeOnDelete();
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intervals');
    }
};
