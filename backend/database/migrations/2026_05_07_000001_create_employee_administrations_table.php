<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('employee_administrations');

        Schema::table('employer_appointments', function (Blueprint $table) {
            $table->string('recruitment_category_id', 12)->nullable()->after('appointment_letter');
            $table->string('recruitment_subject_id', 12)->nullable()->after('recruitment_category_id');
        });
    }

    public function down(): void
    {
        Schema::table('employer_appointments', function (Blueprint $table) {
            $table->dropColumn(['recruitment_category_id', 'recruitment_subject_id']);
        });
    }
};
