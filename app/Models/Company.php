<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'cin',
        'email',
        'phone',
        'address',
    ];

    public function results(): HasMany
    {
        return $this->hasMany(TenderResult::class, 'winning_company_id');
    }
}
