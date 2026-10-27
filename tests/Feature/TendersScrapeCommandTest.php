<?php

namespace Tests\Feature;

use App\Models\Portal;
use App\Models\Sector;
use App\Models\State;
use App\Models\Tender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TendersScrapeCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenders_scrape_command_is_registered_and_has_help(): void
    {
        $this->artisan('tenders:scrape', ['--help' => true])
            ->assertExitCode(0);
    }

    public function test_models_and_foreign_keys_allow_null_sector_and_state(): void
    {
        $portal = Portal::create([
            'name' => 'Rajasthan State Public Procurement Portal',
            'code' => 'SPPP_RAJASTHAN',
            'url' => 'https://sppp.rajasthan.gov.in',
            'status' => 'active',
        ]);

        // Create tender without sector and state (null foreign keys)
        $tender = Tender::create([
            'portal_id' => $portal->id,
            'state_id' => null,
            'sector_id' => null,
            'authority_id' => null,
            'tender_ref' => 'TEST-REF-001',
            'title' => 'Sample Tender with Null Sector and State',
            'status' => 'live',
        ]);

        $this->assertDatabaseHas('tenders', [
            'id' => $tender->id,
            'tender_ref' => 'TEST-REF-001',
            'sector_id' => null,
            'state_id' => null,
        ]);
    }
}
