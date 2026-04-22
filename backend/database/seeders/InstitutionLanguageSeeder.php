<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;


class InstitutionLanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('institution_languages')->insert([
            [
                'language_id' => 'SLID01',
                'name'        => 'Sinhala',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'language_id' => 'SLID02',
                'name'        => 'Tamil',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'language_id' => 'SLID03',
                'name'        => 'English',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'language_id' => 'SLID04',
                'name'        => 'Sinhala & Tamil',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'language_id' => 'SLID05',
                'name'        => 'Sinhala & English',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'language_id' => 'SLID06',
                'name'        => 'Tamil & English',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'language_id' => 'SLID07',
                'name'        => 'Sinhala Tamil & English',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
        ]);
    }
}
