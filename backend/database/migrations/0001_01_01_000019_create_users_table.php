<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Encrypted fields
            $table->longText('nic');
            $table->string('nic_hash', 255)->index();  // only index, NOT FK
            $table->string('people_id', 12)->unique()->nullable()->index();

            $table->longText('name');

            // Contact
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->char('contact', 10)->unique();
            $table->timestamp('contact_verified_at')->nullable();

            // Authentication
            $table->string('password');
            $table->string('profile_picture')->nullable();
            $table->rememberToken();

            $table->boolean('active_status')->default(true);

            // Audit
            $table->string('created_by', 12)->nullable()->index();
            $table->string('updated_by', 12)->nullable()->index();

            $table->timestamps();

            // ONLY SAFE FOREIGN KEY
            $table->foreign('people_id')
                ->references('people_id')
                ->on('people')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });

        // Audit trail relationships
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('created_by')
                ->references('people_id')
                ->on('people')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreign('updated_by')
                ->references('people_id')
                ->on('people')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
