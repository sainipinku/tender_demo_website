<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenderResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'tender_id',
        'winning_company_id',
        'bid_amount',
        'result_date',
        'remarks',
    ];

    protected $casts = [
        'bid_amount' => 'float',
        'result_date' => 'datetime',
    ];

    public function tender(): BelongsTo
    {
        return $this->belongsTo(Tender::class);
    }

    public function winningCompany(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'winning_company_id');
    }
}
