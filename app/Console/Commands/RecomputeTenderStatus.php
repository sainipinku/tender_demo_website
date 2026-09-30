<?php

namespace App\Console\Commands;

use App\Models\Tender;
use Carbon\Carbon;
use Illuminate\Console\Command;

class RecomputeTenderStatus extends Command
{
    protected $signature = 'tenders:recompute-status';

    protected $description = 'Recompute lifecycle statuses of live tenders based on closing and opening timestamps';

    public function handle(): int
    {
        $now = Carbon::now();

        // 1. Mark past closing date tenders as closed (if not result_declared)
        $closedCount = Tender::whereIn('status', ['live', 'closing_soon'])
            ->where('closes_at', '<', $now)
            ->update(['status' => 'closed']);

        // 2. Mark tenders closing within 72 hours as closing_soon
        $closingSoonCount = Tender::where('status', 'live')
            ->whereBetween('closes_at', [$now, $now->copy()->addHours(72)])
            ->update(['status' => 'closing_soon']);

        // 3. Mark upcoming tenders whose submission date has arrived as live
        $liveCount = Tender::where('status', 'upcoming')
            ->where('submission_start_at', '<=', $now)
            ->update(['status' => 'live']);

        $this->info("Status recompute completed: {$closedCount} closed, {$closingSoonCount} closing soon, {$liveCount} activated live.");

        return 0;
    }
}
