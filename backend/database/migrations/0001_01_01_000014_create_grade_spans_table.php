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
        Schema::create('grade_spans', function (Blueprint $table) {
            $table->id();
            $table->char('grade_span_id', 10)->unique()->comment('example. 1-5 , 1-8, 6-9, 10-13');
            $table->string('grade_span_name', 150)->unique()->comment('Grade Span Name');
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grade_spans');
    }
};
