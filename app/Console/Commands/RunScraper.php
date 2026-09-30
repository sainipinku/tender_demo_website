<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class RunScraper extends Command
{
    protected $signature = 'tenders:scrape {--portal=all} {--pages=all}';

    protected $description = 'Run Python scraper to dynamically fetch live tenders from government portals with continuous auto-pagination and zero duplicates';

    public function handle(): int
    {
        $portal = (string) $this->option('portal');
        $pages = (string) $this->option('pages');

        $this->info("Starting dynamic continuous auto-pagination live scraper for portal '{$portal}' (Pages: {$pages})...");

        $baseDir = base_path();
        $cmd = ["{$baseDir}/scraper/venv/bin/python3", "{$baseDir}/scraper/main.py", '--portal', $portal, '--pages', $pages];

        $process = new Process($cmd, $baseDir, ['PYTHONPATH' => $baseDir]);
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
