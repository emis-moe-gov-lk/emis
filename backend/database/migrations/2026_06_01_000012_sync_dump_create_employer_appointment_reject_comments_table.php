<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('employer_appointment_reject_comments')) {
            return;
        }

        Schema::create('employer_appointment_reject_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employer_appointment_id');
            $table->char('people_id', 12)->comment('People ID of the rejecting officer');
            $table->char('rejected_people_id', 12)->nullable()->comment('People ID of the rejected profile');
            $table->text('reject_comment')->nullable();
            $table->dateTime('reject_date');
            $table->timestamps();

            $table->index('employer_appointment_id', 'idx_ea_rc_appt');
            $table->index('people_id', 'idx_ea_rc_people');
            $table->index('rejected_people_id', 'idx_ea_rc_rejected_people');

            $table->foreign('employer_appointment_id', 'fk_ea_rc_appt')
                ->references('id')
                ->on('employer_appointments')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('people_id', 'fk_ea_rc_people')
                ->references('people_id')
                ->on('people')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('rejected_people_id', 'fk_ea_rc_rejected_people')
                ->references('people_id')
                ->on('people')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employer_appointment_reject_comments');
    }
};
