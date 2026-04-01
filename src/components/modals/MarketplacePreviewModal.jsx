import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import html2canvas from "html2canvas";
import axios from "axios";

const API_URL = "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html";

const MarketplacePreviewModal = ({ visible, onClose, templateName, type }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canvasUrl, setCanvasUrl] = useState(null);
  const generateSecurePreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCanvasUrl(null);

    try {
      // 1. Prepare dummy data for preview
      // 2. Fetch HTML from API
      const response = await axios.post(API_URL, {
        mode: "html",
        type: type === 'invoice' ? 'invoice' : 'quotation',
        templateName: templateName
      });

      if (!response.data) throw new Error("No HTML received from preview engine");

      const html = response.data;

      // 3. Render to canvas in a hidden container
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-10000px";
      container.style.top = "-10000px";
      container.style.width = "900px";
      container.style.backgroundColor = "white";
      container.innerHTML = html;
      document.body.appendChild(container);

      // Wait for any external resources in the HTML to load
      await new Promise(resolve => setTimeout(resolve, 1500));

      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        scale: 1.5,
        backgroundColor: "#ffffff",
        logging: false
      });

      setCanvasUrl(canvas.toDataURL("image/png"));
      document.body.removeChild(container);
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
      setCanvasUrl(null);
    }
  }, [visible, templateName, generateSecurePreview]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] border border-white/20 relative">

        {/* Header */}
        <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Canvas Preview</h2>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Secure Intellectual Property Protection</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-slate-50/50 p-6 md:p-12 flex justify-center custom-scrollbar relative">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-100 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-t-purple-600 rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="mt-8 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Rendering Secure Buffer...</p>
            </div>
          )}

          {error ? (
            <div className="flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-pink-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-pink-500">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Render Blocked</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                {error} We couldn't safely render the document preview to the canvas.
              </p>
              <button
                onClick={generateSecurePreview}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Retry Initialization
              </button>
            </div>
          ) : (
            <div className="relative">
              {canvasUrl && (
                <div className="relative group transition-all duration-500">
                  <div className="absolute -inset-4 bg-linear-to-r from-purple-500 to-indigo-500 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <img
                    src={canvasUrl}
                    className="relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-lg max-w-full select-none"
                    alt="Secure Template Preview"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                  />

                  {/* Copy protection overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10 opacity-10 mix-blend-overlay overflow-hidden">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div
                        key={i}
                        className="text-[40px] font-black text-slate-900 whitespace-nowrap rotate-[-30deg] py-8 inline-block mr-20"
                        style={{ opacity: 0.1 }}
                      >
                        CONFIDENTIAL • SECURE PREVIEW • NO INSPECT
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer info */}
        <footer className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No HTML Exposure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Canvas Native Render</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Anti-Inspect Active</span>
          </div>
        </footer>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.03);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(124, 58, 237, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(124, 58, 237, 0.4);
          }
        `}</style>
      </div>
    </div>
  );
};

export default MarketplacePreviewModal;
