<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recruitment_categories', function (Blueprint $table) {
            $table->id();
            $table->string('category_id', 12)->unique()->index();
            $table->string('category_name', 100)->unique();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recruitment_categories');
    }
};
