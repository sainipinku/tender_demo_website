<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@tendersetu.in',
            'password' => bcrypt('password'),
        ]);

        $this->call([
            StatesSeeder::class,
            SectorsSeeder::class,
            PortalsSeeder::class,
            AuthoritiesSeeder::class,
            TendersSeeder::class,
        ]);
    }
}
