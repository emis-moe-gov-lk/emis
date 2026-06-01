<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('teacher_role_transitions')) {
            return;
        }

        Schema::create('teacher_role_transitions', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id', 12)->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('appointment_id', 12)->index();
            $table->string('from_role', 64)->index();
            $table->string('to_role', 64)->index();
            $table->string('changed_by', 12)->nullable()->index();
            $table->timestamp('changed_at')->index();
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('employee_id')
                ->references('people_id')
                ->on('people')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('appointment_id')
                ->references('appointment_id')
                ->on('employer_appointments')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('changed_by')
                ->references('people_id')
                ->on('people')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->index(['employee_id', 'changed_at'], 'idx_trt_employee_changed_at');
            $table->index(['from_role', 'to_role', 'changed_at'], 'idx_trt_role_path_changed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_role_transitions');
    }
};
