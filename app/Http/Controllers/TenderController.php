<?php

namespace App\Http\Controllers;

use App\Http\Resources\TenderResource;
use App\Models\Portal;
use App\Models\Sector;
use App\Models\State;
use App\Models\Tender;
use App\Services\TenderSearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TenderController extends Controller
{
    public function __construct(protected TenderSearchService $searchService) {}

    public function index(Request $request): Response
    {
        $query = $this->searchService->search($request);
        $tenders = $query->paginate(12)->withQueryString();

        $states = State::orderBy('name')->get();
        $sectors = Sector::orderBy('name')->get();
        $portals = Portal::where('status', 'active')->get();

        // Get suggestion chips (popular keywords & authorities)
        $suggestions = [
            'Patna STP', 'Railway Coaches', 'NHAI Expressway', 'Solar PV Grid',
            'Jal Jeevan Mission', 'CT Scanner Hospital', 'Bridge Construction',
        ];

        return Inertia::render('Tenders/Index', [
            'tenders' => TenderResource::collection($tenders),
            'filters' => $request->all(),
            'states' => $states,
            'sectors' => $sectors,
            'portals' => $portals,
            'suggestions' => $suggestions,
            'totalCount' => Tender::count(),
            'liveCount' => Tender::where('status', 'live')->count(),
            'closingSoonCount' => Tender::where('status', 'closing_soon')->count(),
        ]);
    }

    public function show($id): Response
    {
        $tender = Tender::with([
            'portal', 'authority', 'state', 'sector', 'documents', 'result.winningCompany',
        ])->findOrFail($id);

        $similarTenders = Tender::where('sector_id', $tender->sector_id)
            ->where('id', '!=', $tender->id)
            ->with(['authority', 'state'])
            ->limit(4)
            ->get();

        return Inertia::render('Tenders/Show', [
            'tender' => new TenderResource($tender),
            'similarTenders' => TenderResource::collection($similarTenders),
        ]);
    }

    public function mapAggregate(Request $request)
    {
        $metric = $request->input('metric', 'count'); // 'count' or 'value'
        $status = $request->input('status');

        $query = DB::table('states')
            ->leftJoin('tenders', function ($join) use ($status) {
                $join->on('states.id', '=', 'tenders.state_id');
                if ($status) {
                    $join->where('tenders.status', '=', $status);
                }
            })
            ->select(
                'states.id as state_id',
                'states.name as state_name',
                'states.code as state_code',
                'states.latitude',
                'states.longitude',
                DB::raw('COUNT(tenders.id) as tender_count'),
                DB::raw('COALESCE(SUM(tenders.tender_value), 0) as total_value'),
                DB::raw('SUM(CASE WHEN tenders.status = "live" THEN 1 ELSE 0 END) as live_count'),
                DB::raw('SUM(CASE WHEN tenders.status = "closing_soon" THEN 1 ELSE 0 END) as closing_soon_count'),
                DB::raw('SUM(CASE WHEN tenders.status = "result_declared" THEN 1 ELSE 0 END) as completed_count')
            )
            ->groupBy('states.id', 'states.name', 'states.code', 'states.latitude', 'states.longitude')
            ->get();

        return response()->json([
            'metric' => $metric,
            'data' => $query,
        ]);
    }
}
