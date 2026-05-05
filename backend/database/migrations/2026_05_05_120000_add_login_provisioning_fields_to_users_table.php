<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('must_change_password')->default(true)->after('password');
            $table->timestamp('password_initialized_at')->nullable()->after('must_change_password');
            $table->timestamp('password_changed_at')->nullable()->after('password_initialized_at');
            $table->string('identity_provider', 50)->default('asgardeo')->after('password_changed_at');
            $table->string('identity_provider_user_id')->nullable()->unique()->after('identity_provider');
            $table->unsignedInteger('default_password_version')->default(1)->after('identity_provider_user_id');
            $table->timestamp('account_provisioned_at')->nullable()->after('default_password_version');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['identity_provider_user_id']);
            $table->dropColumn([
                'must_change_password',
                'password_initialized_at',
                'password_changed_at',
                'identity_provider',
                'identity_provider_user_id',
                'default_password_version',
                'account_provisioned_at',
            ]);
        });
    }
};
