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
        Schema::create('districts_lists', function (Blueprint $table) {
            $table->id();
            $table->string('district_id',10)->unique();
            $table->unsignedInteger('district_code')->unique();
            $table->string('province_id',10);
            $table->string('district_name',50)->unique();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('province_id')->references('province_id')->on('provinces_lists')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('districts_lists');
    }
};
