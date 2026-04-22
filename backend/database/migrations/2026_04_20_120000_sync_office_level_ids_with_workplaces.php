<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach ([
            'employer_appointments',
            'employer_current_appointments',
        ] as $table) {
            DB::statement("
                UPDATE {$table} AS appointment
                INNER JOIN workplaces AS workplace
                    ON workplace.workplace_id = appointment.workplace_id
                SET appointment.office_level_id = workplace.office_level_id
                WHERE appointment.office_level_id <> workplace.office_level_id
            ");
        }
    }

    public function down(): void
    {
        // Irreversible: this migration corrects inconsistent historical data in-place.
    }
};
