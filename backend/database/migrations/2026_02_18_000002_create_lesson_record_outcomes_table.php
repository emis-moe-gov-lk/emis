<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_record_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_record_id')->constrained()->cascadeOnDelete();
            $table->string('description', 500);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_record_outcomes');
    }
};
