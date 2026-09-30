<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portal_id')->constrained('portals')->cascadeOnDelete();
            $table->foreignId('authority_id')->nullable()->constrained('authorities')->nullOnDelete();
            $table->foreignId('state_id')->nullable()->constrained('states')->nullOnDelete();
            $table->foreignId('sector_id')->nullable()->constrained('sectors')->nullOnDelete();

            $table->string('tender_ref');
            $table->text('title');
            $table->text('description')->nullable();
            $table->string('location')->nullable();

            // Financials in INR (decimal 15, 2)
            $table->decimal('tender_value', 15, 2)->nullable();
            $table->decimal('emd_amount', 15, 2)->nullable();
            $table->decimal('document_fee', 12, 2)->nullable();

            // Lifecycle status: upcoming, live, closing_soon, closed, result_declared
            $table->enum('status', ['upcoming', 'live', 'closing_soon', 'closed', 'result_declared'])->default('live');

            // Critical Dates
            $table->timestamp('published_at')->nullable();
            $table->timestamp('submission_start_at')->nullable();
            $table->timestamp('closes_at')->nullable();
            $table->timestamp('opening_at')->nullable();

            $table->string('raw_hash', 64)->nullable();
            $table->string('official_url', 1000)->nullable();

            $table->timestamps();

            // Constraints & Indexes
            $table->unique(['portal_id', 'tender_ref'], 'tenders_portal_ref_unique');
            $table->index(['status', 'closes_at'], 'tenders_status_closes_index');
            $table->index(['state_id', 'sector_id'], 'tenders_state_sector_index');
            $table->index('tender_value', 'tenders_value_index');
            $table->fullText(['title', 'description'], 'tenders_title_desc_fulltext');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenders');
    }
};
