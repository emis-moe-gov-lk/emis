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
        Schema::table('grade_spans', function (Blueprint $table) {
            $table->unsignedTinyInteger('start_grade')
                ->after('grade_span_name')
                ->nullable()
                ->comment('Starting grade number');

            $table->unsignedTinyInteger('end_grade')
                ->after('start_grade')
                ->nullable()
                ->comment('Ending grade number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grade_spans', function (Blueprint $table) {
            $table->dropColumn(['start_grade', 'end_grade']);
        });
    }
};
