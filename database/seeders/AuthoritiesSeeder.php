<?php

namespace Database\Seeders;

use App\Models\Authority;
use App\Models\Portal;
use App\Models\State;
use Illuminate\Database\Seeder;

class AuthoritiesSeeder extends Seeder
{
    public function run(): void
    {
        $biharPortal = Portal::where('code', 'BIHAR_EPROC2')->first();
        $cpppPortal = Portal::where('code', 'CPPP_GOV')->first();
        $mahaPortal = Portal::where('code', 'MAHA_TENDERS')->first();

        $biharState = State::where('code', 'BR')->first();
        $mahaState = State::where('code', 'MH')->first();
        $delhiState = State::where('code', 'DL')->first();
        $upState = State::where('code', 'UP')->first();

        $authorities = [
            [
                'portal_id' => $biharPortal?->id,
                'state_id' => $biharState?->id,
                'name' => 'Bihar Urban Infrastructure Development Corporation (BUIDCO)',
                'code' => 'BUIDCO',
            ],
            [
                'portal_id' => $biharPortal?->id,
                'state_id' => $biharState?->id,
                'name' => 'Public Works Department (PWD) Bihar',
                'code' => 'PWD_BR',
            ],
            [
                'portal_id' => $biharPortal?->id,
                'state_id' => $biharState?->id,
                'name' => 'Bihar State Educational Infrastructure Development Corp',
                'code' => 'BSEIDC',
            ],
            [
                'portal_id' => $cpppPortal?->id,
                'state_id' => $delhiState?->id,
                'name' => 'National Highways Authority of India (NHAI)',
                'code' => 'NHAI',
            ],
            [
                'portal_id' => $cpppPortal?->id,
                'state_id' => $delhiState?->id,
                'name' => 'Central Public Works Department (CPWD)',
                'code' => 'CPWD',
            ],
            [
                'portal_id' => $mahaPortal?->id,
                'state_id' => $mahaState?->id,
                'name' => 'Mumbai Metropolitan Region Development Authority (MMRDA)',
                'code' => 'MMRDA',
            ],
            [
                'portal_id' => $cpppPortal?->id,
                'state_id' => $upState?->id,
                'name' => 'Uttar Pradesh Expressways Industrial Development Authority (UPEIDA)',
                'code' => 'UPEIDA',
            ],
        ];

        foreach ($authorities as $auth) {
            Authority::updateOrCreate(['name' => $auth['name']], $auth);
        }
    }
}
