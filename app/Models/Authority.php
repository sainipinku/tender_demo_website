<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Authority extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_id',
        'state_id',
        'name',
        'code',
    ];

    public function portal(): BelongsTo
    {
        return $this->belongsTo(Portal::class);
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function tenders(): HasMany
    {
        return $this->hasMany(Tender::class);
    }
}
