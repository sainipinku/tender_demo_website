<?php

namespace App\Services;

use App\Models\Tender;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TenderSearchService
{
    public function search(Request $request): Builder
    {
        $query = Tender::with(['portal', 'authority', 'state', 'sector', 'documents', 'result.winningCompany']);

        // 1. Universal Search (keyword, authority, tender_ref)
        if ($search = $request->input('search')) {
            $query->where(function (Builder $q) use ($search) {
                // If MySQL FULLTEXT is available, try raw match or fallback to LIKE
                $q->where('tender_ref', 'LIKE', "%{$search}%")
                    ->orWhere('title', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhereHas('authority', function ($authQ) use ($search) {
                        $authQ->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('code', 'LIKE', "%{$search}%");
                    });
            });
        }

        // 2. Filter by State (single id or code)
        if ($state = $request->input('state')) {
            if (is_numeric($state)) {
                $query->where('state_id', $state);
            } else {
                $query->whereHas('state', fn ($q) => $q->where('code', strtoupper($state)));
            }
        }

        // 3. Filter by Sector
        if ($sector = $request->input('sector')) {
            if (is_numeric($sector)) {
                $query->where('sector_id', $sector);
            } else {
                $query->whereHas('sector', fn ($q) => $q->where('slug', strtolower($sector)));
            }
        }

        // 4. Filter by Status (upcoming, live, closing_soon, closed, result_declared)
        if ($status = $request->input('status')) {
            if (is_array($status)) {
                $query->whereIn('status', $status);
            } else {
                $query->where('status', $status);
            }
        }

        // 5. Value Bands
        if ($valueBand = $request->input('value_band')) {
            switch ($valueBand) {
                case 'under_1cr':
                    $query->where('tender_value', '<', 10000000);
                    break;
                case '1cr_10cr':
                    $query->whereBetween('tender_value', [10000000, 100000000]);
                    break;
                case '10cr_100cr':
                    $query->whereBetween('tender_value', [100000000, 1000000000]);
                    break;
                case 'above_100cr':
                    $query->where('tender_value', '>=', 1000000000);
                    break;
            }
        }

        // Direct Min/Max Value Range
        if ($minVal = $request->input('min_value')) {
            $query->where('tender_value', '>=', (float) $minVal);
        }
        if ($maxVal = $request->input('max_value')) {
            $query->where('tender_value', '<=', (float) $maxVal);
        }

        // 6. Closing Date Filter (closing within N days)
        if ($closingDays = $request->input('closing_days')) {
            $query->whereBetween('closes_at', [
                now(),
                now()->addDays((int) $closingDays),
            ]);
        }

        // 7. Portal Filter
        if ($portalId = $request->input('portal_id')) {
            $query->where('portal_id', $portalId);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'published_at');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        switch ($sortBy) {
            case 'value':
                $query->orderBy('tender_value', $sortOrder);
                break;
            case 'closing':
                $query->orderBy('closes_at', $sortOrder);
                break;
            case 'title':
                $query->orderBy('title', $sortOrder);
                break;
            default:
                $query->orderBy('published_at', $sortOrder)->orderBy('id', 'desc');
                break;
        }

        return $query;
    }
}
