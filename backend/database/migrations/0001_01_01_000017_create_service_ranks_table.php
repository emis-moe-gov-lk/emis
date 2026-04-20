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
        Schema::create('service_ranks', function (Blueprint $table) {
            $table->id();
            $table->char('rank_id', 10)->unique()->comment('e.g., RANK001, RANK002');
            $table->char('service_id', 10);
            $table->string('rank_name')->comment('e.g., III(a), III(b), II, I, etc.');
            $table->string('description')->nullable();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();

            $table->foreign('service_id')->references('service_id')->on('services')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_ranks');
    }
};
