<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class RunScraper extends Command
{
    protected $signature = 'tenders:scrape {--portal=all} {--pages=all} {--months=2} {--priority-city=jaipur} {--city-only}';

    protected $description = 'Run Python scraper to dynamically fetch live tenders from government portals with continuous auto-pagination, prioritizing Jaipur tenders first';

    public function handle(): int
    {
        $portal = (string) $this->option('portal');
        $pages = (string) $this->option('pages');
        $months = (string) $this->option('months');
        $priorityCity = (string) $this->option('priority-city');
        $cityOnly = (bool) $this->option('city-only');

        $this->info("Starting live scraper for portal '{$portal}' (Priority City: '{$priorityCity}' FIRST, Pages: {$pages})...");

        $baseDir = base_path();
        $cmd = [
            "{$baseDir}/scraper/venv/bin/python3",
            "{$baseDir}/scraper/main.py",
            '--portal', $portal,
            '--pages', $pages,
            '--months', $months,
            '--priority-city', $priorityCity,
        ];

        if ($cityOnly) {
            $cmd[] = '--city-only';
        }

        $connectionName = config('database.default', 'mysql');
        $dbConfig = config("database.connections.{$connectionName}", []);
        if ($connectionName !== 'mysql' && empty($dbConfig['host'])) {
            $dbConfig = config('database.connections.mysql', []);
        }

        $extraEnv = [
            'PYTHONPATH' => $baseDir,
            'DB_HOST' => (string) ($dbConfig['host'] ?? env('DB_HOST', '127.0.0.1')),
            'DB_PORT' => (string) ($dbConfig['port'] ?? env('DB_PORT', 3306)),
            'DB_DATABASE' => (string) ($dbConfig['database'] ?? env('DB_DATABASE', 'tender_db')),
            'DB_NAME' => (string) ($dbConfig['database'] ?? env('DB_DATABASE', 'tender_db')),
            'DB_USERNAME' => (string) ($dbConfig['username'] ?? env('DB_USERNAME', 'root')),
            'DB_USER' => (string) ($dbConfig['username'] ?? env('DB_USERNAME', 'root')),
            'DB_SOCKET' => (string) ($dbConfig['unix_socket'] ?? env('DB_SOCKET', '')),
        ];

        $pw = $dbConfig['password'] ?? env('DB_PASSWORD');
        if ($pw !== null && $pw !== '') {
            $extraEnv['DB_PASSWORD'] = (string) $pw;
        }

        $env = array_merge($_SERVER, $_ENV, $extraEnv);

        $process = new Process($cmd, $baseDir, $env);
        $process->setTimeout(86400); // 24 hours process timeout for full portal auto-pagination

        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if (! $process->isSuccessful()) {
            $this->error('Scraper failed: '.$process->getErrorOutput());

            return 1;
        }

        $this->info('Live scraper finished successfully!');

        return 0;
    }
}
