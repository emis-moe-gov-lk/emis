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
        Schema::create('cadre_circulars', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('circular_id', 20)->unique()->index();
            $table->string('circular_no', 50)->unique()->index();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->date('issued_date');
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->string('document_path', 255)->nullable();

            // Self-reference to *id* (numeric PK)
            $table->string('supersedes_id', 20)->nullable();

            $table->string('created_by', 20)->nullable();
            $table->string('updated_by', 20)->nullable();

            $table->timestamps();
        });

        Schema::table('cadre_circulars', function (Blueprint $table) {
            $table->foreign('supersedes_id')
                ->references('circular_id')->on('cadre_circulars')
                ->onDelete('set null')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cadre_circulars');
    }
};
