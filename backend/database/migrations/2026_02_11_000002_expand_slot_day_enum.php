<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE slots MODIFY COLUMN day ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE slots MODIFY COLUMN day ENUM('Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL");
    }
};
