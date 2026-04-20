<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('people', function (Blueprint $table) {
            $table->id();

            // Master identifier (stable)
            $table->string('people_id', 12)->unique()->index();

            // NIC fields
            $table->longText('nic');       // encrypted NIC
            $table->string('nic_hash', 256)->unique()->index(); // for searching

            // Personal information
            $table->char('title_id', 3)->index();
            $table->longText('full_name');
            $table->longText('name_with_initials');

            $table->char('gender_id', 3)->index();
            $table->date('date_of_birth');

            $table->char('religion_id', 3)->index();
            $table->char('ethnicity_id', 3)->index();
            $table->char('civil_status_id', 3)->index();

            $table->boolean('health_condition')->default(true);
            $table->text('health_problem')->nullable();

            $table->char('blood_group_id', 3)->nullable()->index();

            // Contact
            $table->string('email')->unique();
            $table->string('phone', 10)->unique();

            // Address
            $table->char('district_id', 10)->nullable()->index();
            $table->char('gn_division_id', 10)->nullable()->index();

            $table->text('address_line1');
            $table->text('address_line2');
            $table->text('address_line3')->nullable();

            $table->string('postal_code', 10)->nullable();

            $table->string('latitude', 10)->nullable();
            $table->string('longitude', 10)->nullable();

            // Temporary address
            $table->text('t_address_line1')->nullable();
            $table->text('t_address_line2')->nullable();
            $table->text('t_address_line3')->nullable();
            $table->string('t_postal_code', 10)->nullable();

            $table->string('profile_picture')->nullable();
            $table->boolean('active_status')->default(true);

            // Audit (self references)
            $table->string('created_by', 12)->nullable()->index();
            $table->string('updated_by', 12)->nullable()->index();

            $table->timestamps();

            // Foreign keys (non-self)
            $table->foreign('district_id')->references('district_id')->on('districts_lists')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('gn_division_id')->references('gn_division_id')->on('gn_divisions')->onDelete('restrict')->onUpdate('cascade');

            $table->foreign('title_id')->references('title_id')->on('titles')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('gender_id')->references('gender_id')->on('gender_lists')->onDelete('restrict')->onUpdate('cascade');

            $table->foreign('religion_id')->references('religion_id')->on('religions')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('ethnicity_id')->references('ethnicity_id')->on('ethnicities')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('blood_group_id')->references('blood_group_id')->on('blood_groups')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('civil_status_id')->references('civil_status_id')->on('civil_statuses')->onDelete('restrict')->onUpdate('cascade');
        });

        // Self-referencing foreign keys (must be added after table creation)
        Schema::table('people', function (Blueprint $table) {
            $table->foreign('created_by')
                ->references('people_id')
                ->on('people')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreign('updated_by')
                ->references('people_id')
                ->on('people')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('people');
    }
};
