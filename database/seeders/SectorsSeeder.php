<?php

namespace Database\Seeders;

use App\Models\Sector;
use Illuminate\Database\Seeder;

class SectorsSeeder extends Seeder
{
    public function run(): void
    {
        $sectors = [
            ['name' => 'Civil Works & Construction', 'slug' => 'construction', 'description' => 'Roads, bridges, flyovers, commercial and residential buildings'],
            ['name' => 'IT & Electronics', 'slug' => 'it-electronics', 'description' => 'Software desarrollo, hardware procurement, networking & data centers'],
            ['name' => 'Healthcare & Medical Equipment', 'slug' => 'healthcare', 'description' => 'Hospitals, medical supplies, pharmaceuticals and lab instruments'],
            ['name' => 'Energy & Solar Power', 'slug' => 'energy', 'description' => 'Solar parks, power distribution, transformers, green energy projects'],
            ['name' => 'Water Supply & Sanitation', 'slug' => 'water-sanitation', 'description' => 'Pipe laying, water treatment plants, sewage systems'],
            ['name' => 'Transport & Logistics', 'slug' => 'transport', 'description' => 'Buses, electric vehicles, warehousing, fleet operations'],
            ['name' => 'Education & Vocational Training', 'slug' => 'education', 'description' => 'School infrastructure, digital classrooms, skill development'],
            ['name' => 'Defense & Homeland Security', 'slug' => 'defense', 'description' => 'Surveillance, tactical gear, defense infrastructure'],
            ['name' => 'Agriculture & Water Resources', 'slug' => 'agriculture', 'description' => 'Irrigation canals, seeds distribution, cold storage facilities'],
            ['name' => 'Consultancy & Facility Management', 'slug' => 'consultancy', 'description' => 'Project management, housekeeping, security staffing'],
        ];

        foreach ($sectors as $sec) {
            Sector::updateOrCreate(['slug' => $sec['slug']], $sec);
        }
    }
}
