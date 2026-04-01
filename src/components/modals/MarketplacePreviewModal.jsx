import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, Sparkles, AlertCircle, ShieldCheck, FileText, CheckCircle2, ArrowLeft, MoreVertical } from "lucide-react";
import axios from "axios";

const API_URL = "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html";

const MarketplacePreviewModal = ({ visible, onClose, templateName, type }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const generateSecurePreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPreviewHtml(null);
    setIsLoaded(false);

    try {
      // Fetch HTML from API
      const response = await axios.post(API_URL, {
        mode: "html",
        type: type === 'invoice' ? 'invoice' : 'quotation',
        templateName: templateName
      });

      if (!response.data) throw new Error("No HTML received from preview engine");

      setPreviewHtml(response.data);
    } catch (err) {
      console.error("Preview generation failure:", err);
      setError("Secure render engine failed to initialize.");
    } finally {
      setLoading(false);
    }
  }, [templateName, type]);

  useEffect(() => {
    if (visible && templateName) {
      generateSecurePreview();
    } else {
      setPreviewHtml(null);
      setIsLoaded(false);
    }
  }, [visible, templateName, generateSecurePreview]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-md flex flex-col animate-in fade-in duration-300 select-none overflow-hidden">
      
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
              <Sparkles size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-slate-900 font-black text-xl tracking-tight leading-none">Template Studio</h1>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  <CheckCircle2 size={10} />
                  Live Proof
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Previewing: <span className="text-slate-900">{templateName}</span></p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 mr-4 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Secure Preview Active</span>
          </div>
          
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
        
        {/* Floating Controls Overlay */}
        {!error && previewHtml && (
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
        <div className="w-full max-w-250 h-full bg-white rounded-5xl shadow-2xl shadow-slate-200 overflow-hidden relative border border-slate-100 animate-in zoom-in-95 duration-500">
          
          {/* Internal Loading State */}
          {(loading || !isLoaded) && !error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Initializing Template Render...</p>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 bg-pink-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-pink-500 group">
                <AlertCircle size={40} className="group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-slate-900 font-black text-3xl tracking-tight mb-3">Render Engine Failure</h2>
              <p className="text-slate-500 max-w-sm font-medium mb-10 leading-relaxed">
                We couldn't safely render the digital proof for this template. Please try refreshing or contact support.
              </p>
              <button
                onClick={generateSecurePreview}
                className="px-10 py-4 bg-slate-900 text-white rounded-4xl font-black text-sm uppercase tracking-[0.15em] shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3"
              >
                Retry Initialization
              </button>
            </div>
          ) : previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0 select-text"
              title="Template Digital Proof"
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
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Protected Instance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Interactive Proof</span>
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

export default MarketplacePreviewModal;
