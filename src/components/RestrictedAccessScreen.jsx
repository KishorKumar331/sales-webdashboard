import React, { useState, useEffect } from 'react';
import { Lock, LogOut, ArrowRight, Star } from 'lucide-react';

const RestrictedAccessScreen = ({ paymentUrl, onLogout, userEmail, checkSession }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [hasStartedPayment, setHasStartedPayment] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      window.open(paymentUrl, '_blank');
      setHasStartedPayment(true);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, paymentUrl]);

  useEffect(() => {
    if (!hasStartedPayment || !checkSession || !userEmail) return;

    // Trigger check immediately upon redirection/click
    checkSession(userEmail, true).catch(console.error);

    let isChecking = false;
    const interval = setInterval(async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        await checkSession(userEmail, true);
      } catch (err) {
        console.error("Error during profile status check:", err);
      } finally {
        isChecking = false;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [hasStartedPayment, checkSession, userEmail]);

  const handlePayNow = () => {
    window.open(paymentUrl, '_blank');
    setHasStartedPayment(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />





      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl relative z-10 flex flex-col items-center text-center">
        {/* Animated Lock Badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
          <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg relative border border-white/10">
            <Lock size={36} className="animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
        </div>




        {/* Title */}
        <h2 className="text-2xl font-black tracking-tight text-white mb-2 flex items-center gap-2 justify-center">


          Access Restricted


        </h2>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Subscription Expired
        </div>



        {/* Description */}
        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed max-w-sm">
          Your account access has been restricted. Please complete your subscription payment to unlock the full dashboard and restore all services.
        </p>

        {/* Countdown / Redirecting message */}
        <div className="w-full bg-slate-800/40 border border-slate-800/50 rounded-2xl p-4 mb-6 text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          Please ComeBack After Payment Success
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayNow}
          className="w-full group relative overflow-hidden flex items-center justify-center gap-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white p-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-purple-500/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          Pay & Unlock Now
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        </button>

        {/* Logout Option */}
        <button
          onClick={onLogout}
          className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};

export default RestrictedAccessScreen;
