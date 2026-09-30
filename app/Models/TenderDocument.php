<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenderDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'tender_id',
        'title',
        'file_url',
        'file_size',
        'file_type',
    ];

    public function tender(): BelongsTo
    {
        return $this->belongsTo(Tender::class);
    }
}
