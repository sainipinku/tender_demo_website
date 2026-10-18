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
        $scraperDirectory = $baseDir.DIRECTORY_SEPARATOR.'scraper';
        $pythonExecutable = PHP_OS_FAMILY === 'Windows'
            ? $scraperDirectory.DIRECTORY_SEPARATOR.'venv'.DIRECTORY_SEPARATOR.'Scripts'.DIRECTORY_SEPARATOR.'python.exe'
            : $scraperDirectory.DIRECTORY_SEPARATOR.'venv'.DIRECTORY_SEPARATOR.'bin'.DIRECTORY_SEPARATOR.'python3';

        if (! is_file($pythonExecutable)) {
            $this->error("Python virtual environment not found at [{$pythonExecutable}].");
            $this->line('Create the environment and install scraper dependencies:');
            $this->line(PHP_OS_FAMILY === 'Windows'
                ? '  py -m venv scraper\\venv'
                : '  python3 -m venv scraper/venv');
            $this->line(PHP_OS_FAMILY === 'Windows'
                ? '  scraper\\venv\\Scripts\\python.exe -m pip install -r scraper\\requirements.txt'
                : '  scraper/venv/bin/python3 -m pip install -r scraper/requirements.txt');

            return self::FAILURE;
        }

        $cmd = [
            $pythonExecutable,
            $scraperDirectory.DIRECTORY_SEPARATOR.'main.py',
            '--portal',
            $portal,
            '--pages',
            $pages,
        ];

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
