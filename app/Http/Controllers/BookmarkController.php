<?php

namespace App\Http\Controllers;

use App\Http\Resources\TenderResource;
use App\Models\Bookmark;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $bookmarks = Bookmark::where('user_id', $user?->id ?? 1)
            ->with(['tender.portal', 'tender.authority', 'tender.state', 'tender.sector'])
            ->latest()
            ->get();

        $savedSearches = $user ? $user->savedSearches()->latest()->get() : [];

        return Inertia::render('Saved', [
            'bookmarks' => $bookmarks->map(fn ($b) => new TenderResource($b->tender)),
            'savedSearches' => $savedSearches,
        ]);
    }

    public function toggle(Request $request, $tenderId)
    {
        $user = $request->user();
        if (! $user) {
            // For demo purposes if non-authenticated session
            return response()->json(['bookmarked' => true, 'message' => 'Tender bookmarked (guest session)']);
        }

        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('tender_id', $tenderId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();

            return response()->json(['bookmarked' => false, 'message' => 'Bookmark removed']);
        } else {
            Bookmark::create([
                'user_id' => $user->id,
                'tender_id' => $tenderId,
            ]);

            return response()->json(['bookmarked' => true, 'message' => 'Tender bookmarked']);
        }
    }
}
