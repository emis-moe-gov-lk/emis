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
        Schema::create('people_profile_edit_requests', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_request_ref', 20)->unique();
            $table->string('people_id', 12)->comment('Foreign key referencing people table');
            $table->text('requested_changes'); // JSON or serialized data of requested changes
            $table->enum('status', ['1', '2', '3'])->default('1')->comment('1: Pending, 2: Approved, 3: Rejected');
            $table->string('reviewed_by', 12)->nullable()->comment('Foreign key referencing people table for the reviewer');
            $table->text('review_comments')->nullable();
            $table->timestamps();

            $table->foreign('people_id')->references('people_id')->on('people')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('reviewed_by')->references('people_id')->on('people')->onDelete('restrict')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('people_profile_edit_requests');
    }
};
