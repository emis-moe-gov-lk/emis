<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employer_appointment_histories', function (Blueprint $table) {
            $table->string('appointment_letter_no')->nullable()->after('updated_type');
            $table->text('remarks')->nullable()->after('appointment_letter_no');
            $table->date('end_date')->nullable()->change();
        });

        // Expand updated_type enum: 0=Position Change, 1=Rank Change, 2=Transfer, 3=Retirement, 4=Other
        DB::statement("ALTER TABLE employer_appointment_histories MODIFY COLUMN updated_type ENUM('0','1','2','3','4') NOT NULL DEFAULT '0' COMMENT '0: Position Change, 1: Rank Change, 2: Transfer, 3: Retirement, 4: Other'");
    }

    public function down(): void
    {
        Schema::table('employer_appointment_histories', function (Blueprint $table) {
            $table->dropColumn(['appointment_letter_no', 'remarks']);
            $table->date('end_date')->nullable(false)->change();
        });

        DB::statement("ALTER TABLE employer_appointment_histories MODIFY COLUMN updated_type ENUM('0','1') NOT NULL DEFAULT '0'");
    }
};
