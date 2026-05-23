import React, { useState } from "react";
import { X, Download, AlertCircle, Loader2, FileText, Share2, Sparkles, ArrowLeft, MoreVertical, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html";

const PdfPreviewModal = ({
  visible,
  data,
  pdfHtml,
  onClose,
  clientName = "Quotation",
  onShare,
  documentType = "quotation",
  fileName,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, _] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const generateFileName = () => {
    if (fileName) return fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const timestamp = `${day}-${month}-${year}`;

    let name = "client";
    let dest = "";
    let d = "";

    if (data) {
      name = data.customer?.name || data["Client-Name"] || data.clientName || data.GuestName || clientName;
      dest = data.destination || data.DestinationName || "";
      d = data.packageSummary?.days || data.Days || data.days || "";
    } else {
      name = clientName !== "Quotation" && clientName !== "DigitalInvoice" ? clientName : "client";
    }

    if (typeof name === 'string') name = name.replace(/\s+/g, '');
    if (typeof dest === 'string') dest = dest.replace(/\s+/g, '');

    if (documentType === "invoice") {
      return `${name}invoice${timestamp}.pdf`;
    } else {
      return `${name}${dest}${d ? d + 'days' : ''}${timestamp}.pdf`;
    }
  };

  const handleDownload = async () => {
    try {
      if (!pdfHtml) {
        toast.error("Cloud generation data missing");
        return;
      }

      setIsGenerating(true);
      const finalFileName = generateFileName();

      const response = await axios.post(API_URL, {
        mode: "pdf",
        type: documentType,
        html: pdfHtml,
        fileName: finalFileName,
        tripId: data?.TripId || data?.tripId,
        quoteId: data?.QuoteId || data?.quoteId,
      });

      const fileUrl = response?.data?.url;
      if (!fileUrl) throw new Error("Sync failure: No file path received");

      const fileResponse = await axios.get(fileUrl, { responseType: "blob" });
      const blob = new Blob([fileResponse.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", finalFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
      toast.success("Document synchronized and downloaded successfully ✅");

      if (onShare) onShare();
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Infrastructure failure: PDF generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md flex flex-col animate-in fade-in duration-300 select-none overflow-hidden">

      {/* Header Bar */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-inner">
              <FileText size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-slate-900 font-black text-xl tracking-tight leading-none">Preview Studio</h1>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  <CheckCircle2 size={10} />
                  Live Rendering
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Viewing: <span className="text-slate-900">{clientName}</span></p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-lg active:scale-95 ${isGenerating
                ? 'bg-slate-100 text-slate-400'
                : 'bg-linear-to-r from-purple-600 to-indigo-700 text-white shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5'
              }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download size={16} />
                Export PDF
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="flex-1 overflow-hidden relative flex flex-col items-center bg-[#F1F5F9] px-4 py-8 custom-scrollbar">

        {/* Floating Controls Overlay (Optional aesthetic touch) */}
        {!error && pdfHtml && (
          <div className="absolute top-10 right-10 z-20 flex flex-col gap-3">
            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-4xl shadow-2xl border border-white flex flex-col gap-2">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer" title="High Quality">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer" title="Options">
                <MoreVertical size={18} />
              </div>
            </div>
          </div>
        )}

        {/* Content Wrapper */}
        <div className="w-full max-w-[1000px] h-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden relative border border-slate-100 animate-in zoom-in-95 duration-500">

          {/* Internal Loading State */}
          {!isLoaded && !error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Processing Visual Assets...</p>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 bg-pink-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-pink-500 group">
                <AlertCircle size={40} className="group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-slate-900 font-black text-3xl tracking-tight mb-3">Preview Synchronization Failed</h2>
              <p className="text-slate-500 max-w-sm font-medium mb-10 leading-relaxed">
                The digital render engine encountered an unexpected interruption. We recommend using the direct export option to view the document.
              </p>
              <button
                onClick={handleDownload}
                className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.15em] shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3"
              >
                <Download size={18} />
                Download Original PDF
              </button>
            </div>
          ) : pdfHtml ? (
            <iframe
              srcDoc={pdfHtml}
              className="w-full h-full border-0 select-text"
              title="Digital Proof Preview"
              onLoad={() => setIsLoaded(true)}
            />
          ) : null}
        </div>

        {/* Footer Info Area */}
        <div className="mt-8 flex items-center gap-8 justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Cloud Synchronized</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Secure Transfer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">High-Fidelity Render</span>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default PdfPreviewModal;
