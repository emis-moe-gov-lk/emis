<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('slots', 'date')) {
            DB::statement('ALTER TABLE slots ADD COLUMN `date` DATE NULL AFTER `purpose`');
        }

        // Drop the FK that references teacher_id (it blocks dropping the unique index)
        $fks = DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_NAME = 'slots' AND TABLE_SCHEMA = DATABASE()
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        ");

        foreach ($fks as $fk) {
            if (str_contains($fk->CONSTRAINT_NAME, 'teacher_id')) {
                DB::statement("ALTER TABLE slots DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
            }
        }

        // Drop old unique, add new one including date
        DB::statement('ALTER TABLE slots DROP INDEX `slots_teacher_id_day_period_id_unique`');
        DB::statement('ALTER TABLE slots ADD UNIQUE `slots_teacher_id_day_period_id_date_unique` (`teacher_id`, `day`, `period_id`, `date`)');

        // Re-add the FK on teacher_id pointing to teacher_timetable_configs
        DB::statement('ALTER TABLE slots ADD CONSTRAINT `slots_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_timetable_configs`(`id`) ON DELETE CASCADE');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE slots DROP FOREIGN KEY `slots_teacher_id_foreign`');
        DB::statement('ALTER TABLE slots DROP INDEX `slots_teacher_id_day_period_id_date_unique`');
        DB::statement('ALTER TABLE slots ADD UNIQUE `slots_teacher_id_day_period_id_unique` (`teacher_id`, `day`, `period_id`)');
        DB::statement('ALTER TABLE slots ADD CONSTRAINT `slots_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_timetable_configs`(`id`) ON DELETE CASCADE');

        if (Schema::hasColumn('slots', 'date')) {
            DB::statement('ALTER TABLE slots DROP COLUMN `date`');
        }
    }
};
