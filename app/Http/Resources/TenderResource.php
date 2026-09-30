<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tender_ref' => $this->tender_ref,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'tender_value' => $this->tender_value,
            'formatted_value' => $this->formatted_value,
            'emd_amount' => $this->emd_amount,
            'document_fee' => $this->document_fee,
            'status' => $this->status,
            'published_at' => $this->published_at?->toIso8601String(),
            'submission_start_at' => $this->submission_start_at?->toIso8601String(),
            'closes_at' => $this->closes_at?->toIso8601String(),
            'opening_at' => $this->opening_at?->toIso8601String(),
            'official_url' => $this->official_url,
            'portal' => $this->whenLoaded('portal', fn () => [
                'id' => $this->portal->id,
                'name' => $this->portal->name,
                'code' => $this->portal->code,
            ]),
            'authority' => $this->whenLoaded('authority', fn () => [
                'id' => $this->authority->id,
                'name' => $this->authority->name,
                'code' => $this->authority->code,
            ]),
            'state' => $this->whenLoaded('state', fn () => [
                'id' => $this->state->id,
                'name' => $this->state->name,
                'code' => $this->state->code,
                'latitude' => $this->state->latitude,
                'longitude' => $this->state->longitude,
            ]),
            'sector' => $this->whenLoaded('sector', fn () => [
                'id' => $this->sector->id,
                'name' => $this->sector->name,
                'slug' => $this->sector->slug,
            ]),
            'documents' => $this->whenLoaded('documents', fn () => $this->documents->map(fn ($doc) => [
                'id' => $doc->id,
                'title' => $doc->title,
                'file_url' => $doc->file_url,
                'file_size' => $doc->file_size,
                'file_type' => $doc->file_type,
            ])),
            'result' => $this->whenLoaded('result', fn () => $this->result ? [
                'id' => $this->result->id,
                'bid_amount' => $this->result->bid_amount,
                'result_date' => $this->result->result_date?->toIso8601String(),
                'remarks' => $this->result->remarks,
                'winning_company' => $this->result->winningCompany ? [
                    'id' => $this->result->winningCompany->id,
                    'name' => $this->result->winningCompany->name,
                ] : null,
            ] : null),
            'is_bookmarked' => $request->user() ? $this->bookmarks()->where('user_id', $request->user()->id)->exists() : false,
        ];
    }
}
