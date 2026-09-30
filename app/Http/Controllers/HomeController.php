<?php

namespace App\Http\Controllers;

use App\Http\Resources\TenderResource;
use App\Models\Sector;
use App\Models\State;
use App\Models\Tender;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $featuredTenders = Tender::with(['portal', 'authority', 'state', 'sector'])
            ->whereIn('status', ['live', 'closing_soon'])
            ->orderBy('tender_value', 'desc')
            ->limit(6)
            ->get();

        $latestTenders = Tender::with(['portal', 'authority', 'state', 'sector'])
            ->orderBy('published_at', 'desc')
            ->limit(6)
            ->get();

        $sectors = Sector::withCount('tenders')->orderBy('tenders_count', 'desc')->get();
        $states = State::withCount('tenders')->orderBy('tenders_count', 'desc')->limit(12)->get();

        $stats = [
            'total_tenders' => Tender::count(),
            'live_tenders' => Tender::where('status', 'live')->count(),
            'closing_soon' => Tender::where('status', 'closing_soon')->count(),
            'total_value_cr' => round(Tender::sum('tender_value') / 10000000, 2),
        ];

        return Inertia::render('Home', [
            'featuredTenders' => TenderResource::collection($featuredTenders),
            'latestTenders' => TenderResource::collection($latestTenders),
            'sectors' => $sectors,
            'states' => $states,
            'stats' => $stats,
        ]);
    }
}
