<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('employer_appointment_reject_comments', 'rejected_people_id')) {
            return;
        }

        Schema::table('employer_appointment_reject_comments', function (Blueprint $table) {
            $table->char('rejected_people_id', 12)
                ->nullable()
                ->after('people_id')
                ->comment('People ID of the rejected profile');

            $table->index('rejected_people_id', 'idx_ea_rc_rejected_people');
            $table->foreign('rejected_people_id', 'fk_ea_rc_rejected_people')
                ->references('people_id')
                ->on('people')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('employer_appointment_reject_comments', 'rejected_people_id')) {
            return;
        }

        Schema::table('employer_appointment_reject_comments', function (Blueprint $table) {
            $table->dropForeign('fk_ea_rc_rejected_people');
            $table->dropIndex('idx_ea_rc_rejected_people');
            $table->dropColumn('rejected_people_id');
        });
    }
};
