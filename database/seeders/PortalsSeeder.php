<?php

namespace Database\Seeders;

use App\Models\Portal;
use Illuminate\Database\Seeder;

class PortalsSeeder extends Seeder
{
    public function run(): void
    {
        $portals = [
            [
                'name' => 'CPWD eTenders Portal',
                'code' => 'CPWD_ETENDERS',
                'url' => 'https://etenders.cpwd.gov.in/tenderAwardedDetails.html',
                'status' => 'active',
            ],
            [
                'name' => 'Bihar eProcurement 2.0',
                'code' => 'BIHAR_EPROC2',
                'url' => 'https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action#latestTenders',
                'status' => 'active',
            ],
            [
                'name' => 'Central Public Procurement Portal (CPPP)',
                'code' => 'CPPP_GOV',
                'url' => 'https://eprocure.gov.in/eprocure/app',
                'status' => 'active',
            ],
            [
                'name' => 'Government e-Marketplace (GeM)',
                'code' => 'GEM_GOV',
                'url' => 'https://gem.gov.in',
                'status' => 'active',
            ],
            [
                'name' => 'Maharashtra Tenders Portal',
                'code' => 'MAHA_TENDERS',
                'url' => 'https://mahatenders.gov.in',
                'status' => 'active',
            ],
            [
                'name' => 'Uttar Pradesh eProcurement',
                'code' => 'UP_EPROC',
                'url' => 'https://etender.up.nic.in',
                'status' => 'active',
            ],
        ];

        foreach ($portals as $p) {
            Portal::updateOrCreate(['code' => $p['code']], $p);
        }
    }
}
