<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('employer_current_appointments', 'service_id')) {
            return;
        }

        Schema::table('employer_current_appointments', function (Blueprint $table) {
            // Nullable to be safe against existing rows in the dump DB;
            // tighten the constraint once backfilled.
            $table->char('service_id', 20)->nullable()->after('appointment_letter_no')
                ->comment('Service ID from services table');
            $table->foreign('service_id')
                ->references('service_id')
                ->on('services')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('employer_current_appointments', 'service_id')) {
            Schema::table('employer_current_appointments', function (Blueprint $table) {
                $table->dropForeign(['service_id']);
                $table->dropColumn('service_id');
            });
        }
    }
};
