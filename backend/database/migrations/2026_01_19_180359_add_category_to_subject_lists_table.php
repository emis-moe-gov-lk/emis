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
        Schema::table('subject_lists', function (Blueprint $table) {
            $table->unsignedTinyInteger('type')
                ->default(1)
                ->comment('1 = subject, 2 = designation, 3 = other')
                ->after('name_ta');

            $table->char('grade_mask', 13)
                ->default('0000000000000')
                ->comment('Grades 1–13: 0 = not offered, 1 = mandatory, 2 = optional')
                ->after('type');

            $table->char('language_mask', 4)
                ->default('0000')
                ->comment('Language mask: index 0=Sinhala, 1=Tamil, 2=English, 3=Other; each index value: 0=no,1=yes')
                ->after('grade_mask');

            $table->char('category_mask', 13)
                ->default('0000000000000')
                ->comment('Grades 1–13: 0 = Common, 1 = First Language, 2 = Secound Language, 3 - Religion, 4 - Category 01, 5 - Category 02, 6 - Category 03, 7 - Advance Level')
                ->after('language_mask');
        });
    }

    public function down(): void
    {
        Schema::table('subject_lists', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->dropColumn('grade_mask');
            $table->dropColumn('language_mask');
            $table->dropColumn('category_mask');

        });
    }


};
