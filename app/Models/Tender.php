<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tender extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_id',
        'authority_id',
        'state_id',
        'sector_id',
        'tender_ref',
        'title',
        'description',
        'location',
        'tender_value',
        'emd_amount',
        'document_fee',
        'status',
        'published_at',
        'submission_start_at',
        'closes_at',
        'opening_at',
        'raw_hash',
        'official_url',
    ];

    protected $casts = [
        'tender_value' => 'float',
        'emd_amount' => 'float',
        'document_fee' => 'float',
        'published_at' => 'datetime',
        'submission_start_at' => 'datetime',
        'closes_at' => 'datetime',
        'opening_at' => 'datetime',
    ];

    public function portal(): BelongsTo
    {
        return $this->belongsTo(Portal::class);
    }

    public function authority(): BelongsTo
    {
        return $this->belongsTo(Authority::class);
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(TenderDocument::class);
    }

    public function result(): HasOne
    {
        return $this->hasOne(TenderResult::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    // Dynamic accessor for value display format (Cr / Lakh)
    public function getFormattedValueAttribute(): string
    {
        if (! $this->tender_value) {
            return 'Refer Document';
        }

        $val = $this->tender_value;
        if ($val >= 10000000) { // >= 1 Crore
            return '₹'.number_format($val / 10000000, 2).' Cr';
        } elseif ($val >= 100000) { // >= 1 Lakh
            return '₹'.number_format($val / 100000, 2).' Lakh';
        }

        return '₹'.number_format($val, 2);
    }
}
