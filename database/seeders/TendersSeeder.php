<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class TendersSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Running dynamic Python scraper to populate database with live government tenders...');

        // Execute dynamic live scraper for GeM CPPP (5 pages)
        Artisan::call('tenders:scrape', [
            '--portal' => 'gem_cppp',
            '--pages' => '5',
        ], $this->command->getOutput());
    }
}
