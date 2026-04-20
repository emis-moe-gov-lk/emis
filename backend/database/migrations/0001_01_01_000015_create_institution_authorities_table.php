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
        Schema::create('institution_authorities', function (Blueprint $table) {
            $table->id();
            $table->char('authority_id', 10)->unique()->comment('example. AUID01, AUID02');
            $table->string('authority_name', 150)->unique()->comment('Ministry of Education, Department of Education, etc.');
            $table->string('description')->nullable();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institution_authorities');
    }
};
