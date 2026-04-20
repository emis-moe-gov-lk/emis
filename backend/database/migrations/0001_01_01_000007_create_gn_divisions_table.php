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
        Schema::create('gn_divisions', function (Blueprint $table) {
            $table->id();
            $table->string('gn_division_id',10)->unique();
            $table->string('dso_id',10);
            $table->string('gn_division_name',100);
            $table->string('gn_division_code',10);
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('dso_id')->references('dso_id')->on('divisional_secretariat_offices')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gn_divisions');
    }
};
