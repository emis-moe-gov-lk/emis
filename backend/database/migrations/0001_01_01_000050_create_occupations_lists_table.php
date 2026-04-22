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
        Schema::create('occupations_lists', function (Blueprint $table) {
            $table->id();
            $table->string('occ_id',10)->unique();
            $table->string('occ_name_en',50)->unique();
            $table->string('occ_name_si',50)->nullable();
            $table->string('occ_name_ta',50)->nullable();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('occupations_lists');
    }
};
