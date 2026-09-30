import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import StatusBadge from '../../Components/StatusBadge';
import TenderCard from '../../Components/TenderCard';
import {
  Building2, MapPin, Calendar, ExternalLink, FileText, Download,
  Share2, Bookmark, Award, Clock, ArrowLeft, ShieldCheck, CheckCircle2
} from 'lucide-react';

export default function Show({ tender, similarTenders }) {
  const data = tender.data || tender;
  const [copied, setCopied] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Specified';
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainLayout>
      <Head title={`${data.title} - Tender Details`} />

      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* Back Link */}
        <Link
          href="/tenders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Tenders
        </Link>

        {/* Top Header Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 relative border border-slate-800 shadow-2xl">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <StatusBadge status={data.status} />
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                {data.sector?.name || 'General Procurement'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? 'Link Copied!' : 'Share'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono text-cyan-400 tracking-wider">
              TENDER REF: {data.tender_ref} • Source: {data.portal?.name || 'Government Portal'}
            </div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-white leading-tight">
              {data.title}
            </h1>
          </div>

          {/* Key Quick Data Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">Tender Value</span>
              <span className="font-heading font-bold text-lg md:text-xl text-cyan-300">
                {data.formatted_value || 'Refer NIT'}
              </span>
            </div>

            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">EMD Amount</span>
              <span className="font-heading font-bold text-base md:text-lg text-emerald-400">
                {data.emd_amount ? `₹${data.emd_amount.toLocaleString('en-IN')}` : 'Refer NIT'}
              </span>
            </div>

            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">Document Fee</span>
              <span className="font-heading font-bold text-base text-slate-200">
                {data.document_fee ? `₹${data.document_fee.toLocaleString('en-IN')}` : 'Exempted / Free'}
              </span>
            </div>

            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">Submission Closes</span>
              <span className="font-semibold text-xs md:text-sm text-amber-400 flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(data.closes_at)}
              </span>
            </div>
          </div>

        </div>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Work Description */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Detailed Scope of Work
              </h2>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 pt-3">
                {data.description || 'Detailed technical specifications and BOQ items are described in the attached official NIT procurement documents.'}
              </div>
            </div>

            {/* Critical Dates Timeline */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Procurement Timeline & Important Dates
              </h2>

              <div className="space-y-3 text-xs md:text-sm border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 font-medium">e-Published Date:</span>
                  <span className="font-semibold text-slate-200">{formatDate(data.published_at)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 font-medium">Bid Submission Start Date:</span>
                  <span className="font-semibold text-slate-200">{formatDate(data.submission_start_at || data.published_at)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 border-l-4 border-l-amber-500">
                  <span className="text-slate-300 font-bold">Bid Submission Closing Date:</span>
                  <span className="font-bold text-amber-400">{formatDate(data.closes_at)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 font-medium">Technical Bid Opening Date:</span>
                  <span className="font-semibold text-slate-200">{formatDate(data.opening_at)}</span>
                </div>
              </div>
            </div>

            {/* Official Documents Download Section */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                Attached Tender Documents ({data.documents?.length || 0})
              </h2>

              <div className="space-y-3 border-t border-slate-800 pt-4">
                {data.documents?.length === 0 ? (
                  <p className="text-xs text-slate-400">No standalone PDF documents attached. Access via official portal link.</p>
                ) : (
                  data.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs">
                          {doc.file_type?.toUpperCase() || 'PDF'}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-slate-200 block">{doc.title}</span>
                          <span className="text-[10px] text-slate-400">{doc.file_size || 'Official Notice PDF'}</span>
                        </div>
                      </div>

                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tender Result Card (If Declared) */}
            {data.result && (
              <div className="glass-card rounded-2xl p-6 space-y-4 border-2 border-purple-500/30 bg-purple-950/20">
                <h2 className="font-heading font-bold text-lg text-purple-300 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Contract Award & Winning Bidder
                </h2>
                <div className="space-y-2 text-xs md:text-sm text-slate-200 border-t border-purple-800/40 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Winning Company:</span>
                    <strong className="text-purple-300">{data.result.winning_company?.name || 'Declared L1 Bidder'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Awarded Bid Amount:</span>
                    <strong className="text-emerald-400">₹{(data.result.bid_amount / 10000000).toFixed(2)} Crore</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Result Date:</span>
                    <span>{formatDate(data.result.result_date)}</span>
                  </div>
                  <p className="text-xs text-slate-300 italic pt-2 border-t border-slate-800">
                    "{data.result.remarks}"
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            
            {/* Authority & Location Details */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-heading font-semibold text-sm text-slate-300 uppercase tracking-wider">
                Issuing Organization
              </h3>

              <div className="space-y-3 text-xs text-slate-200">
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-100">{data.authority?.name || 'Central Ministry'}</strong>
                    <span className="text-[10px] text-slate-400">Code: {data.authority?.code || 'GOV-IND'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-100">{data.location || 'India'}</strong>
                    <span className="text-[10px] text-slate-400">State: {data.state?.name || 'All India'}</span>
                  </div>
                </div>
              </div>

              {/* Link to Official Web Portal */}
              {data.official_url && (
                <div className="pt-2">
                  <a
                    href={data.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-cyan-500/20"
                  >
                    <span>View Official Government Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Similar Tenders */}
            {similarTenders?.data?.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-heading font-semibold text-sm text-slate-300 uppercase tracking-wider">
                  Similar Sector Tenders
                </h3>
                <div className="space-y-4">
                  {similarTenders.data.map((st) => (
                    <TenderCard key={st.id} tender={st} />
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </MainLayout>
  );
}
