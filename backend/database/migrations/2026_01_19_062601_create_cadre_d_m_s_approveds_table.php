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
        Schema::create('cadre_d_m_s_approveds', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->string('circular_id', 20);
            $table->string('workplace_id', 20);

            $table->string('subject_id', 20)->nullable();
            $table->string('medium_id', 20)->nullable();

            $table->integer('approved_posts');
            $table->integer('calculated_posts')->nullable();

            $table->enum('approval_type', ['rule', 'exception', 'manual'])
                ->default('rule');

            $table->date('approved_date')->nullable();
            $table->text('remarks')->nullable();

            // Verification
            $table->boolean('is_verified')->default(false)->comment('true = Verified, false = Not Verified');
            $table->char('verified_by', 12)->nullable()->index()->comment('People ID of verifier');
            $table->dateTime('verified_date')->nullable();

            // Confirmation
            $table->boolean('is_confirmed')->default(false)->comment('true = Confirmed, false = Not Confirmed');
            $table->char('confirmed_by', 12)->nullable()->index()->comment('People ID of confirmer');
            $table->dateTime('confirmed_date')->nullable();

            // Status
            $table->boolean('active_status')->default(true)->comment('true = Active, false = Inactive');

            // Audit Fields
            $table->char('created_by', 12)->nullable();
            $table->char('updated_by', 12)->nullable();

            $table->timestamps();


            /** Foreign Keys */
            $table->foreign('circular_id')
                ->references('circular_id')->on('cadre_circulars')
                ->onDelete('restrict')->onUpdate('cascade');

            $table->foreign('workplace_id')
                ->references('workplace_id')->on('workplaces')
                ->onDelete('restrict')->onUpdate('cascade');

            $table->foreign('subject_id')
                ->references('subject_id')->on('subject_lists')
                ->onDelete('set null')->onUpdate('cascade');

            $table->foreign('medium_id')
                ->references('medium_id')->on('medium_of_instructions')
                ->onDelete('set null')->onUpdate('cascade');

            // Audit foreign keys
            $table->foreign('created_by')->references('people_id')->on('people');
            $table->foreign('updated_by')->references('people_id')->on('people');
            $table->foreign('confirmed_by')->references('people_id')->on('people');
            $table->foreign('verified_by')->references('people_id')->on('people');

            /** Unique Constraint */
            $table->unique(
                ['circular_id', 'workplace_id', 'subject_id', 'medium_id'],
                'approved_cadre_unique'
            );
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cadre_d_m_s_approveds');
    }
};
