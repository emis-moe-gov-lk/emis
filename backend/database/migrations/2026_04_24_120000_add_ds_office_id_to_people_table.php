<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('people', function (Blueprint $table) {
            if (! Schema::hasColumn('people', 'ds_office_id')) {
                $table->unsignedBigInteger('ds_office_id')->nullable()->after('district_id');
                $table->foreign('ds_office_id')
                    ->references('id')
                    ->on('divisional_secretariat_offices')
                    ->nullOnDelete()
                    ->cascadeOnUpdate();
            }
        });
    }

    public function down(): void
    {
        Schema::table('people', function (Blueprint $table) {
            if (Schema::hasColumn('people', 'ds_office_id')) {
                $table->dropForeign(['ds_office_id']);
                $table->dropColumn('ds_office_id');
            }
        });
    }
};
