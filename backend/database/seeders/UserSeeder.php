<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\People;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $peopleRecords = People::all();

        foreach ($peopleRecords as $person) {
            // Skip the special NIC (Super Admin)
            if ($person->nic === '999999999999') {
                continue;
            }

            // Skip if this NIC already has a user (check by nic_hash, not nic)
            if (User::where('nic_hash', $person->nic_hash)->exists()) {
                continue;
            }

            User::create([
                'nic'            => $person->nic,        // encrypted automatically by cast or mutator
                'nic_hash'       => $person->nic_hash,   // deterministic hash for uniqueness
                'people_id'      => $person->people_id,  // foreign key
                'name'           => $person->name_with_initials,
                'email'          => $person->email,
                'contact'        => $person->phone,
                'password'       => 'password123',
                'profile_picture'=> 'default.png',
                'remember_token' => Str::random(10),
                'active_status'  => '1',
                'created_at'     => Carbon::now(),
                'updated_at'     => Carbon::now(),
            ]);
        }

        // Optional: create a static admin user
         User::create([
             'nic'            => '999999999999',
             'nic_hash'       => hash('sha256', '999999999999'),
             'people_id'      => null,
             'name'           => 'Super Admin',
             'email'          => 'madusanka.app.online@gmail.com',
             'contact'        => '0767327872',
             'password'       => 'admin@123',
             'profile_picture'=> null,
             'remember_token' => Str::random(10),
             'active_status'  => '1',
         ]);
    }
}
