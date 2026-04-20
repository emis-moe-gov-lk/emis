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
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->char('workplace_id', 10)->unique()->index()->comment('Office ID');
            $table->char('census_no', 10)->unique()->index()->comment('Census Number');
            $table->char('institution_category_id', 10)->comment('Foreign key referencing institution_categories table');
            $table->char('authority_id', 10)->comment('Foreign key referencing authorities table');
            $table->char('language_id', 10)->comment('Foreign key referencing institution_languages table');
            $table->char('gender_id', 10)->comment('Foreign key referencing institution_genders table');
            $table->char('facilities_id', 10)->comment('Foreign key referencing institutional_facilities table');
            $table->char('ethnicity_id', 10)->comment('Foreign key referencing institution_ethnisities table');
            $table->char('institution_types_id', 10)->comment('foreign key referencing institution_types table');
            $table->char('grade_span_id', 10)->nullable()->comment('foreign key referencing grade_spans table');
            $table->enum('sport_s', ['1', '0'])->default('0');
            $table->char('district_id', 10);
            $table->char('zeo_wp_id', 10);
            $table->char('deo_wp_id', 10);
            $table->char('gn_division_id', 10)->nullable();
            $table->char('police_station_id', 10)->nullable()->comment('Foreign key referencing police_stations table');
            $table->char('moh_area_id', 10)->nullable()->comment('Foreign key referencing moh_areas table');
            $table->string('name');
            $table->string('other_name', 50)->nullable();
            $table->year('established_year');
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('address')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();  // total 10 digits, 7 after decimal
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('mission', 255)->nullable();
            $table->text('vision', 255)->nullable();
            $table->string('logo')->nullable();
            $table->boolean('active_status')->default(true)->comment('true: Active, false: Inactive');
            $table->string('created_by', 12)->nullable();
            $table->string('updated_by', 12)->nullable();
            $table->timestamps();

            //$table->foreign('workplace_id')->references('workplace_id')->on('workplaces')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('zeo_wp_id')->references('workplace_id')->on('zonal_education_offices');
            $table->foreign('deo_wp_id')->references('workplace_id')->on('divisional_education_offices');
            $table->foreign('gn_division_id')->references('gn_division_id')->on('gn_divisions');
            $table->foreign('district_id')->references('district_id')->on('districts_lists');
            $table->foreign('institution_category_id')->references('institution_category_id')->on('institution_categories');
            $table->foreign('authority_id')->references('authority_id')->on('institution_authorities');
            $table->foreign('language_id')->references('language_id')->on('institution_languages');
            $table->foreign('gender_id')->references('gender_id')->on('institution_genders');
            $table->foreign('facilities_id')->references('facilities_id')->on('institutional_facilities');
            $table->foreign('ethnicity_id')->references('ethnicity_id')->on('institution_ethnisities');
            $table->foreign('police_station_id')->references('police_station_id')->on('police_stations');
            $table->foreign('moh_area_id')->references('moh_area_id')->on('moh_areas');
            $table->foreign('institution_types_id')->references('institution_types_id')->on('institution_types');
            $table->foreign('grade_span_id')->references('grade_span_id')->on('grade_spans');
            $table->foreign('created_by')->references('people_id')->on('people');
            $table->foreign('updated_by')->references('people_id')->on('people');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
