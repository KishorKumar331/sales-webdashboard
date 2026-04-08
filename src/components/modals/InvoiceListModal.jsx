import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  X,
  Receipt,
  Eye,
  Edit3,
  Plus,
  ArrowLeft,
  History,
  Search,
  Clock,
  Calendar,
  Wallet,
  CheckCircle,
  FileText,
  Sparkles
} from "lucide-react";
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
            <h1 className="text-slate-900 font-black text-2xl tracking-tight leading-none">Invoice Hub</h1>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Billing Manager</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
            Trip ID: <span className="text-blue-600 font-black">{tripId}</span>
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

/* ---------------- INVOICE CARD ---------------- */

const InvoiceCard = ({ invoice, onEdit, onPreview, tripData }) => {
  const totalAmount = (invoice.pricing?.totalAmount || 0) + (invoice.pricing?.gstAmount || 0) + (invoice.pricing?.tcsAmount || 0);

  return (
    <div className="group relative bg-white rounded-[2.5rem] p-8 transition-all duration-300 border-2 border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
            <Receipt size={24} className="text-blue-600" />
          </div>
          <div className="flex flex-col items-end text-right">
            <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 flex items-center gap-1">
              <CheckCircle size={10} />
              {invoice.invoiceStatus || 'Generated'}
            </div>
            <p className="text-slate-900 font-black text-lg tracking-tight">#{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Destination</p>
            <p className="text-slate-900 font-bold text-sm truncate">{invoice.destination || 'Not Specified'}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Invoice Value</p>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-blue-600 font-bold text-sm">₹</span>
              <span className="text-slate-900 font-black text-2xl tracking-tight leading-none">
                {totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => onPreview(invoice)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:shadow-lg active:scale-95 shadow-blue-200"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={() => onEdit({ invoice, data: tripData })}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 shadow-md shadow-slate-100"
          >
            <Edit3 size={16} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN MODAL ---------------- */

export default function InvoiceListModal({ visible, onClose, onCreateNew, data }) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfHtml, setPdfHtml] = useState(null);

  useEffect(() => {
    if (visible && data?.TripId) {
      fetchInvoices();
    }
  }, [visible, data?.TripId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (data?.TripId) params.append("tripId", data.TripId);
      if (data?.invoiceId) params.append("invoiceId", data.invoiceId);

      const response = await fetch(
        `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/invoice-management/invoice?${params.toString()}`
      );

      if (!response.ok) throw new Error("Failed to synchronize invoice database");

      const result = await response.json();
      setInvoices(Array.isArray(result) ? result : [result]);
    } catch (err) {
      setError(err.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInvoice = ({ invoice, data: tripData }) => {
    onClose();
    navigate("/invoices/create", {
      state: {
        editData: invoice,
        tripId: invoice.tripId,
        isEdit: true,
        tripData: tripData
      },
    });
  };

  const handleShareInvoice = async (invoice) => {
    try {
      const response = await axios.post(API_URL, {
        type: "invoice",
        company: "WH",
        mode: "html",
        tripId: data?.TripId,
        invoiceId: invoice?.invoiceId || invoice?.TripId,
        templateName: "invoiceip.hbs",
      });

      if (!response.data) throw new Error("Failed to generate digital copy");
      setPdfHtml(response.data);
      setShowPdfModal(true);
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Cloud generation service unavailable");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col animate-in fade-in duration-300 select-none overflow-hidden">
      <Header
        onClose={onClose}
        tripId={data?.TripId}
        customerName={data?.clientName || data?.GuestName}
      />

      <main className="flex-1 overflow-y-auto px-6 py-12 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Accessing Billing Database...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6 text-pink-500">
                <X size={32} />
              </div>
              <h2 className="text-slate-900 font-black text-2xl mb-2">Sync Synchronization Error</h2>
              <p className="text-slate-500 max-w-sm font-medium mb-8">{error}</p>
              <div className="flex gap-4">
                <button
                  onClick={fetchInvoices}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  Retry Sync
                </button>
                <button
                  onClick={() => { onClose(); onCreateNew(); }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Plus size={18} />
                  Force New Invoice
                </button>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-6 group hover:scale-110 transition-transform">
                <Search size={40} className="text-blue-200" />
              </div>
              <h2 className="text-slate-900 font-black text-3xl tracking-tight mb-2">No Ledger Records Found</h2>
              <p className="text-slate-500 max-w-sm mb-10 font-medium">This trip hasn't reached the billing stage yet. No invoices have been generated.</p>
              <button
                onClick={() => {
                  onClose();
                  onCreateNew();
                }}
                className="px-10 py-4 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3"
              >
                <Plus size={20} strokeWidth={3} />
                Generate Initial Invoice
              </button>
            </div>
          ) : (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h3 className="text-slate-900 font-black text-3xl tracking-tight mb-1">Billing Archive</h3>
                  <p className="text-slate-500 font-semibold flex items-center gap-2">
                    <History size={14} className="text-blue-600" />
                    Tracking <span className="text-slate-900">{invoices.length}</span> individual ledger entries
                  </p>
                </div>

                <button
                  onClick={() => { onClose(); onCreateNew(); }}
                  className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus size={16} strokeWidth={3} />
                  New Record
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {invoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.invoiceId}
                    invoice={invoice}
                    onEdit={handleEditInvoice}
                    onPreview={handleShareInvoice}
                    tripData={data}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <PdfPreviewModal
        visible={showPdfModal}
        pdfHtml={pdfHtml}
        onShare={() => {
          setShowPdfModal(false);
          setPdfHtml(null);
        }}
        clientName="DigitalInvoice"
        onClose={() => {
          setShowPdfModal(false);
          setPdfHtml(null);
        }}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
