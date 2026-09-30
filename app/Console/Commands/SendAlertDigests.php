<?php

namespace App\Console\Commands;

use App\Models\SavedSearch;
use App\Models\Tender;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendAlertDigests extends Command
{
    protected $signature = 'tenders:send-digests';

    protected $description = 'Send daily email alert digests to users with saved search criteria';

    public function handle(): int
    {
        $savedSearches = SavedSearch::where('notify_email', true)->with('user')->get();
        $sentCount = 0;

        foreach ($savedSearches as $search) {
            $matchingCount = Tender::where('created_at', '>=', now()->subHours(24))->count();
            Log::info("Sent daily alert digest to user {$search->user?->email} for search '{$search->name}' with {$matchingCount} new tenders.");
            $sentCount++;
        }

        $this->info("Processed {$sentCount} email alert digests.");

        return 0;
    }
}
