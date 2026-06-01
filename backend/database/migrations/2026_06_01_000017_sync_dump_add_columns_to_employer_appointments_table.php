<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employer_appointments', function (Blueprint $table) {
            if (! Schema::hasColumn('employer_appointments', 'resign_date')) {
                $table->date('resign_date')->nullable()->after('retirement_date');
            }
            if (! Schema::hasColumn('employer_appointments', 'recruitment_category_id')) {
                $table->string('recruitment_category_id', 12)->nullable()->after('appointment_letter');
            }
            if (! Schema::hasColumn('employer_appointments', 'recruitment_subject_id')) {
                $table->string('recruitment_subject_id', 12)->nullable()->after('recruitment_category_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('employer_appointments', function (Blueprint $table) {
            $cols = array_values(array_filter([
                Schema::hasColumn('employer_appointments', 'resign_date') ? 'resign_date' : null,
                Schema::hasColumn('employer_appointments', 'recruitment_category_id') ? 'recruitment_category_id' : null,
                Schema::hasColumn('employer_appointments', 'recruitment_subject_id') ? 'recruitment_subject_id' : null,
            ]));

            if ($cols) {
                $table->dropColumn($cols);
            }
        });
    }
};
