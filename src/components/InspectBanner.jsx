import React from 'react';
import { Eye, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const InspectBanner = () => {
  const { isInspecting, user, clearInspectedUser } = useAuth();

  if (!isInspecting) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300 sticky top-0 z-100 w-full border-b border-amber-600">
      <div className="flex items-center gap-3 font-black text-xs uppercase tracking-widest">
        <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
          <Eye size={16} />
        </div>
        <span>
          Inspect Mode Active: <span className="underline decoration-2 underline-offset-4 decoration-white/40">{user?.user?.fullname || user?.user?.Email}</span>
        </span>
      </div>
      
      <button 
        onClick={clearInspectedUser}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
      >
        <X size={14} />
        Exit Global Inspect
      </button>
    </div>
  );
};

export default InspectBanner;
