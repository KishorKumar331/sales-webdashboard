import React, { useState } from 'react';
import { Download, X, Smartphone, ExternalLink, QrCode } from 'lucide-react';

const FloatingPlayStoreButton = ({ 
  appUrl = "https://play.google.com/store/apps/details?id=com.salesboard.app",
  apkUrl = "#",
  appName = "Quick Quotes Sales App",
  packageName = "com.salesboard.app"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  if (isDismissed) return null;

  const handlePlayStoreClick = (e) => {
    // If apkUrl is provided and not '#', allow direct download or open playstore link
    if (appUrl && appUrl !== '#') {
      window.open(appUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert("App link will be active once published on Google Play Store!");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans transition-all duration-300">
      {/* Expanded Quick Download Card / Popover */}
      {isOpen && (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl border border-slate-700/80 w-80 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">{appName}</h4>
                <p className="text-[11px] text-slate-400">Android Mobile App</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Close card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 my-3 leading-relaxed">
            Download our official Android app to manage quotes, leads, and sales trackings on the go!
          </p>

          {/* Main Google Play Download Badge Button */}
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handlePlayStoreClick}
            className="w-full group relative flex items-center gap-3 bg-black hover:bg-slate-950 text-white p-3 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 shadow-xl overflow-hidden cursor-pointer"
          >
            {/* Play Store Logo SVG */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M325.8 243.7L80.2 4.4C74.6-1.1 66.7-1.5 60.7 1.8L325.8 243.7z" fill="url(#play_blue)" />
                <path d="M418.1 228.6l-92.3-54.9L262.1 237.4l63.7 63.7 92.3-54.9c13.7-8.1 13.7-22.5 0-30.6z" fill="url(#play_yellow)" />
                <path d="M60.7 510.2c6 3.3 13.9 2.9 19.5-2.6l245.6-239.3L60.7 510.2z" fill="url(#play_red)" />
                <path d="M60.7 1.8C54.4 5.3 50.3 12.3 50.3 20.6v470.8c0 8.3 4.1 15.3 10.4 18.8l214.5-253.2L60.7 1.8z" fill="url(#play_green)" />
                <defs>
                  <linearGradient id="play_blue" x1="50" y1="250" x2="330" y2="250" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00A0FF" />
                    <stop offset="1" stopColor="#00C8FF" />
                  </linearGradient>
                  <linearGradient id="play_yellow" x1="260" y1="250" x2="430" y2="250" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFC107" />
                    <stop offset="1" stopColor="#FF8F00" />
                  </linearGradient>
                  <linearGradient id="play_red" x1="50" y1="250" x2="330" y2="250" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF3D00" />
                    <stop offset="1" stopColor="#DD2C00" />
                  </linearGradient>
                  <linearGradient id="play_green" x1="50" y1="20" x2="270" y2="250" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00E676" />
                    <stop offset="1" stopColor="#00B0FF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex flex-col text-left flex-1">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">GET IT ON</span>
              <span className="text-sm font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">Google Play</span>
            </div>

            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </a>

          {/* Quick Direct Download Options */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              v1.2.0 (Latest Release)
            </span>

            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium hover:underline text-[11px]"
            >
              <Download className="w-3 h-3" /> Direct Download
            </a>
          </div>
        </div>
      )}

      {/* Floating Main PlayStore Button */}
      <div className="flex items-center gap-2 group">
        {/* PlayStore Action Badge */}
        <a
          href={appUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handlePlayStoreClick}
          className="relative flex items-center gap-3 bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/80 hover:border-emerald-500/80 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Animated Shine Highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          {/* Play Store Logo SVG */}
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M325.8 243.7L80.2 4.4C74.6-1.1 66.7-1.5 60.7 1.8L325.8 243.7z" fill="url(#float_play_blue)" />
              <path d="M418.1 228.6l-92.3-54.9L262.1 237.4l63.7 63.7 92.3-54.9c13.7-8.1 13.7-22.5 0-30.6z" fill="url(#float_play_yellow)" />
              <path d="M60.7 510.2c6 3.3 13.9 2.9 19.5-2.6l245.6-239.3L60.7 510.2z" fill="url(#float_play_red)" />
              <path d="M60.7 1.8C54.4 5.3 50.3 12.3 50.3 20.6v470.8c0 8.3 4.1 15.3 10.4 18.8l214.5-253.2L60.7 1.8z" fill="url(#float_play_green)" />
              <defs>
                <linearGradient id="float_play_blue" x1="50" y1="250" x2="330" y2="250" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00A0FF" />
                  <stop offset="1" stopColor="#00C8FF" />
                </linearGradient>
                <linearGradient id="float_play_yellow" x1="260" y1="250" x2="430" y2="250" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFC107" />
                  <stop offset="1" stopColor="#FF8F00" />
                </linearGradient>
                <linearGradient id="float_play_red" x1="50" y1="250" x2="330" y2="250" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF3D00" />
                  <stop offset="1" stopColor="#DD2C00" />
                </linearGradient>
                <linearGradient id="float_play_green" x1="50" y1="20" x2="270" y2="250" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00E676" />
                  <stop offset="1" stopColor="#00B0FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Text Content */}
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-widest font-semibold text-slate-400 leading-none">DOWNLOAD APP</span>
            <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">Google Play</span>
          </div>

          <Download className="w-4 h-4 text-emerald-400 animate-bounce ml-1" />
        </a>

        {/* Toggle Info Card / Dismiss Controls */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white p-2.5 rounded-full border border-slate-700 shadow-lg backdrop-blur-sm transition-all duration-200"
          title={isOpen ? "Close info" : "App download options"}
        >
          <Smartphone className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="bg-slate-800/80 hover:bg-red-500/80 text-slate-400 hover:text-white p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Dismiss download button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default FloatingPlayStoreButton;
