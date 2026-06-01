<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'must_change_password')) {
                $table->boolean('must_change_password')->default(true)->after('password');
            }
            if (! Schema::hasColumn('users', 'password_initialized_at')) {
                $table->timestamp('password_initialized_at')->nullable()->after('must_change_password');
            }
            if (! Schema::hasColumn('users', 'password_changed_at')) {
                $table->timestamp('password_changed_at')->nullable()->after('password_initialized_at');
            }
            if (! Schema::hasColumn('users', 'identity_provider')) {
                $table->string('identity_provider', 50)->default('asgardeo')->after('password_changed_at');
            }
            if (! Schema::hasColumn('users', 'identity_provider_user_id')) {
                $table->string('identity_provider_user_id')->nullable()->unique()->after('identity_provider');
            }
            if (! Schema::hasColumn('users', 'default_password_version')) {
                $table->unsignedInteger('default_password_version')->default(1)->after('identity_provider_user_id');
            }
            if (! Schema::hasColumn('users', 'account_provisioned_at')) {
                $table->timestamp('account_provisioned_at')->nullable()->after('default_password_version');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'identity_provider_user_id')) {
                $table->dropUnique(['identity_provider_user_id']);
            }

            $cols = array_values(array_filter([
                Schema::hasColumn('users', 'must_change_password') ? 'must_change_password' : null,
                Schema::hasColumn('users', 'password_initialized_at') ? 'password_initialized_at' : null,
                Schema::hasColumn('users', 'password_changed_at') ? 'password_changed_at' : null,
                Schema::hasColumn('users', 'identity_provider') ? 'identity_provider' : null,
                Schema::hasColumn('users', 'identity_provider_user_id') ? 'identity_provider_user_id' : null,
                Schema::hasColumn('users', 'default_password_version') ? 'default_password_version' : null,
                Schema::hasColumn('users', 'account_provisioned_at') ? 'account_provisioned_at' : null,
            ]));

            if ($cols) {
                $table->dropColumn($cols);
            }
        });
    }
};
