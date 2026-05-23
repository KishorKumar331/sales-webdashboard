import { useState, useEffect } from "react";
import {
  X,
  Eye,
  FileText,
  Clock,
  Calendar,
  ArrowLeft,
  Sparkles,
  Search,
  History,
} from "lucide-react";
import { FetchQuoteByTripID } from "../../api/leads/FetchLeads";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import PdfPreviewModal from "./PdfPreviewModal";

const API_URL = "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html";

/* ---------------- HEADER ---------------- */

const Header = ({ onClose, tripId, customerName }) => (
  <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 shadow-sm">
    <div className="max-w-[1400px] mx-auto flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button 
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-slate-900 font-black text-2xl tracking-tight leading-none">Quotation Hub</h1>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Archive</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
            Trip ID: <span className="text-purple-600 font-black">{tripId}</span>
            <span className="text-slate-300">|</span>
            {customerName && <span className="text-slate-900 font-bold">{customerName}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  </header>
);

/* ---------------- QUOTE CARD ---------------- */

const QuoteCard = ({ quotation, isLatest, onPreview, onDuplicate }) => {
  const formattedDate = new Date(quotation.CreatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className={`group relative bg-white rounded-[2.5rem] p-8 transition-all duration-300 border-2 ${
      isLatest 
        ? 'border-purple-600 shadow-2xl shadow-purple-100 ring-4 ring-purple-50' 
        : 'border-slate-100 hover:border-purple-200 shadow-sm hover:shadow-xl'
    }`}>
      {isLatest && (
        <div className="absolute -top-4 left-8 bg-linear-to-r from-purple-600 to-indigo-700 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-widest">
          <Sparkles size={10} className="animate-pulse" />
          Active Version
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:bg-purple-50 transition-all">
            <FileText size={24} className={isLatest ? "text-purple-600" : "text-slate-400 group-hover:text-purple-600"} />
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
            <p className="text-slate-900 font-black text-lg tracking-tight">#{quotation.QuoteId}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Package Value</p>
          <div className="flex items-baseline gap-1">
            <span className="text-purple-600 font-bold text-lg">₹</span>
            <span className="text-slate-900 font-black text-3xl tracking-tight leading-none">
              {quotation.Costs?.TotalCost?.toLocaleString("en-IN") || "0"}
            </span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => onPreview(quotation)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-purple-600 to-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:shadow-lg active:scale-95 shadow-purple-200"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={() => onDuplicate(quotation)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 shadow-md shadow-slate-100"
          >
            <History size={16} />
            Reuse
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN MODAL ---------------- */

export default function QuotationListModal({ visible, onClose, tripId, data }) {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preview Related
  const [pdfHtml, setPdfHtml] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const fetchQuotations = async (id) => {
    try {
      if (!id) return;
      setLoading(true);
      setError(null);

      const response = await FetchQuoteByTripID(id);
      const quotes = Array.isArray(response?.data) ? response.data : [];
      const sorted = quotes.sort((a, b) => new Date(b.CreatedAt || 0) - new Date(a.CreatedAt || 0));

      setQuotations(sorted);
    } catch (err) {
      console.error(err);
      setError("Failed to synchronize quotation history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && tripId) {
      fetchQuotations(tripId);
    }
  }, [visible, tripId]);

  const handlePreview = async (quotation) => {
    try {
      setSelectedQuotation(quotation);
      const response = await axios.post(API_URL, {
        type: "quotation",
        mode: "html",
        tripId,
        quoteId: quotation.QuoteId,
      });

      if (!response.data) throw new Error("Preview engine failed");
      setPdfHtml(response.data);
      setShowPdfModal(true);
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Cloud preview unavailable");
    }
  };

  const handleDuplicate = (quotation) => {
    onClose();
    navigate("/create-newquote", {
      state: {
        followUpData: {
          ...quotation,
          company: data?.company,
          LeadId: data?.LeadId,
          CreatedAt: data?.CreatedAt,
        },
      },
    });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col animate-in fade-in duration-300 select-none overflow-hidden">
      <Header 
        onClose={onClose} 
        tripId={tripId} 
        customerName={data?.clientName || data?.GuestName} 
      />

      <main className="flex-1 overflow-y-auto px-6 py-12 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Syncing Archive...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                <X className="text-pink-500" size={32} />
              </div>
              <h2 className="text-slate-900 font-black text-2xl mb-2">Connection Interrupted</h2>
              <p className="text-slate-500 max-w-sm font-medium mb-8">{error}</p>
              <button 
                onClick={() => fetchQuotations(tripId)}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                Retry Sync
              </button>
            </div>
          ) : quotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-6 group hover:scale-110 transition-transform">
                <Search size={40} className="text-slate-300" />
              </div>
              <h2 className="text-slate-900 font-black text-3xl tracking-tight mb-2 text-shadow-sm">No Quotations Found</h2>
              <p className="text-slate-500 max-w-sm mb-10 font-medium">It looks like no versions have been generated for this lead yet.</p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/create-newquote", { state: { initialData: data } });
                }}
                className="px-10 py-4 bg-linear-to-r from-purple-600 to-indigo-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-200 hover:shadow-2xl transition-all active:scale-95"
              >
                Generate First Quote
              </button>
            </div>
          ) : (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-slate-900 font-black text-3xl tracking-tight mb-1">Version History</h3>
                  <p className="text-slate-500 font-semibold flex items-center gap-2">
                    <Clock size={14} className="text-purple-600" />
                    Archive contains <span className="text-slate-900">{quotations.length}</span> individual versions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {quotations.map((quote, index) => (
                  <QuoteCard
                    key={quote.QuoteId}
                    quotation={quote}
                    isLatest={index === 0}
                    onPreview={handlePreview}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <PdfPreviewModal
        onShare={() => setShowPdfModal(false)}
        visible={showPdfModal}
        pdfHtml={pdfHtml}
        clientName={selectedQuotation?.QuoteId || "Quotation"}
        data={selectedQuotation}
        onClose={() => {
          setShowPdfModal(false);
          setSelectedQuotation(null);
        }}
      />
    </div>
  );
}
