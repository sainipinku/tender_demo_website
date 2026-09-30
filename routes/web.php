<?php

use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SavedSearchController;
use App\Http\Controllers\TenderController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/tenders', [TenderController::class, 'index'])->name('tenders.index');
Route::get('/tenders/{id}', [TenderController::class, 'show'])->name('tenders.show');

Route::get('/saved', [BookmarkController::class, 'index'])->name('saved.index');
Route::post('/api/bookmarks/toggle/{tenderId}', [BookmarkController::class, 'toggle'])->name('bookmarks.toggle');

Route::post('/api/saved-searches', [SavedSearchController::class, 'store'])->name('saved-searches.store');
Route::delete('/api/saved-searches/{id}', [SavedSearchController::class, 'destroy'])->name('saved-searches.destroy');

Route::get('/api/map/aggregate', [TenderController::class, 'mapAggregate'])->name('api.map.aggregate');
