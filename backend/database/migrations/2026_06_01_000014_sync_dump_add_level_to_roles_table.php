<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('roles', 'level')) {
            return;
        }

        Schema::table('roles', function (Blueprint $table) {
            $table->unsignedTinyInteger('level')->nullable()->after('guard_name');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('roles', 'level')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropColumn('level');
            });
        }
    }
};
