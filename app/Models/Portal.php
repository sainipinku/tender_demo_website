<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Portal extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'url',
        'status',
        'last_scraped_at',
    ];

    protected $casts = [
        'last_scraped_at' => 'datetime',
    ];

    public function tenders(): HasMany
    {
        return $table = $this->hasMany(Tender::class);
    }

    public function authorities(): HasMany
    {
        return $this->hasMany(Authority::class);
    }
}
