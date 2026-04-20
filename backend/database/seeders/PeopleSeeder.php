<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use App\Models\People;
use App\Helpers\NicHelper;

class PeopleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        foreach (range(1, 5) as $index) {
            // Generate a unique plain NIC
            $nicPlain = $faker->unique()->randomElement([
                strtoupper($faker->bothify('#########V')), // Old NIC format
                $faker->numerify('############')          // New NIC format
            ]);

            // Generate full name and initials + surname
            $first    = $faker->firstName;
            $middle   = $faker->firstName;
            $surname  = $faker->lastName;

            $fullName = "{$first} {$middle} {$surname}";   // Example: Kamal Gayan Perera
            $initials = strtoupper(substr($first, 0, 1)) . "." .
                strtoupper(substr($middle, 0, 1)) . ". {$surname}"; // Example: K.G. Perera

            People::create([
                //'people_id'        => strtoupper(Str::random(12)),
                'nic'              => NicHelper::normalize($nicPlain), // encrypted by model
                'nic_hash'         => NicHelper::hash($nicPlain), // unique hash
                'title_id'         => $faker->randomElement(['T01', 'T02', 'T03', 'T04', 'T05']),
                'full_name'        => $fullName,
                'name_with_initials' => $initials,
                'gender_id'           => $faker->randomElement(['G01', 'G02']),
                'date_of_birth'    => $faker->date('Y-m-d', '-18 years'),
                'religion_id'      => $faker->randomElement(['R01', 'R02', 'R03']),
                'ethnicity_id'     => $faker->randomElement(['E01', 'E02', 'E03']),
                'civil_status_id'  => $faker->randomElement(['C01', 'C02', 'C03']),
                'health_condition' => $faker->randomElement(['0', '1']),
                'blood_group_id'   => $faker->randomElement(['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08']),
                'email'            => $faker->unique()->safeEmail,
                'phone'            => $faker->numerify('07########'),
                'district_id'      => $faker->randomElement(['DIS001', 'DIS002', 'DIS003']),
                'gn_division_id'   => $faker->randomElement(['GND00001', 'GND00002', 'GND00003']),
                'address_line1'    => $faker->streetAddress,
                'address_line2'    => $faker->city,
                'address_line3'    => $faker->state,
                'postal_code'      => $faker->postcode,
                'profile_picture'  => 'default.png',
                'active_status'    => '1',
                'created_at'       => Carbon::now(),
                'updated_at'       => Carbon::now(),
            ]);
        }
    }
}
