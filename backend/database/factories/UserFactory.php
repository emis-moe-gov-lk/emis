<?php

namespace Database\Factories;

use App\Models\People;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password used by the factory.
     */
    protected static ?string $password = null;

    /**
     * Define the model's default state.
     */
    public function definition(): array
{
    $nic = $this->faker->unique()->numerify('#########V');

    // ensure a People exists and set people_id
    $people = People::factory()->create();

    return [
        'name'              => $this->faker->name(),
        'email'             => $this->faker->unique()->safeEmail(),
        'email_verified_at' => now(),
        'password'          => static::$password ??= Hash::make('password'),
        'remember_token'    => Str::random(10),
        'nic'               => $nic,
        'nic_hash'          => hash('sha256', $nic),
        'contact'           => $this->faker->unique()->numerify('07########'),
        'people_id'         => $people->getKey(),      // set valid FK
        'created_by'        => null,                   // avoid FK to missing user
        'updated_by'        => null,
    ];
}

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
