<?php

namespace App\Http\Controllers;

use App\Models\SavedSearch;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'filters_json' => 'required|array',
            'notify_email' => 'boolean',
        ]);

        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Please sign in to save searches'], 401);
        }

        $savedSearch = SavedSearch::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'filters_json' => $validated['filters_json'],
            'notify_email' => $validated['notify_email'] ?? true,
        ]);

        return response()->json(['message' => 'Search saved successfully!', 'search' => $savedSearch]);
    }

    public function destroy($id)
    {
        $savedSearch = SavedSearch::findOrFail($id);
        $savedSearch->delete();

        return response()->json(['message' => 'Saved search deleted']);
    }
}
