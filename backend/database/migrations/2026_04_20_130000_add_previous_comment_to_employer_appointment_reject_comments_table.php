<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employer_appointment_reject_comments', function (Blueprint $table) {
            $table->text('previous_comment')
                ->nullable()
                ->after('reject_comment');
        });
    }

    public function down(): void
    {
        Schema::table('employer_appointment_reject_comments', function (Blueprint $table) {
            $table->dropColumn('previous_comment');
        });
    }
};
