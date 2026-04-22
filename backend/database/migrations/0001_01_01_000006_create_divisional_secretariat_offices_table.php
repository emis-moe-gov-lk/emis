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
        Schema::create('divisional_secretariat_offices', function (Blueprint $table) {
            $table->id();
            $table->string('dso_id',10)->unique();
            $table->string('district_id',10);
            $table->string('dso_name',50);
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('district_id')->references('district_id')->on('districts_lists')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('divisional_secretariat_offices');
    }
};
