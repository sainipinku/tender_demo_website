<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrapeRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_name',
        'status',
        'items_found',
        'items_upserted',
        'error_message',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'items_found' => 'integer',
        'items_upserted' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
}
