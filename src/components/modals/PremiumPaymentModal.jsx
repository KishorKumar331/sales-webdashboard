import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Sparkles, CreditCard, ChevronRight, CheckCircle2, Lock, Loader2, Star, Zap } from 'lucide-react';
import { toast } from 'react-toastify';

const PremiumPaymentModal = ({ visible, onClose, onSuccess, templateName, userDetails }) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Load Razorpay script if not already present
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!visible) return null;

  const handlePayment = () => {
    if (!window.Razorpay) {
      toast.error('Payment gateway is loading. Please wait a moment.');
      return;
    }

    setIsProcessingPayment(true);
    const amount = 117882; // ₹999 + 18% GST (₹179.82) = ₹1178.82 in paise

    const options = {
      key: 'rzp_live_SshSY8T6PNSHPq',
      amount: amount,
      currency: 'INR',
      name: 'Quick Quotes Premium',
      description: `Unlock ${templateName || 'Template'}`,
      image: 'https://i.imgur.com/3g7nmJC.png',
      handler: async function (response) {
        setIsProcessingPayment(false);
        if (response.razorpay_payment_id) {
          toast.success('Payment Successful!');
          onSuccess(response);
        }
      },
      prefill: {
        name: userDetails?.FullName || '',
        email: userDetails?.Email || '',
        contact: userDetails?.Phone || ''
      },
      theme: {
        color: '#7c3aed'
      },
      modal: {
        ondismiss: function () {
          setIsProcessingPayment(false);
        }
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-500 text-slate-900">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all active:scale-95"
        >
          <X size={20} />
        </button>

        {/* Premium Banner */}
        <div className="bg-linear-to-br from-purple-600 via-indigo-600 to-indigo-800 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl font-black italic opacity-50" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl opacity-30" />

          <div className="relative z-10 text-white">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/20 mb-4">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Premium Activation</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight mb-2 text-white">Activate Template</h2>
            <p className="text-purple-100/80 text-sm font-medium">Unlock " {templateName?.replace('.hbs', '')} " and all premium features permanently.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speed</p>
                <p className="text-xs font-bold text-slate-900">Instant Access</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">License</p>
                <p className="text-xs font-bold text-slate-900">Life-time</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Premium Template Cost</span>
                <span className="font-bold text-slate-800">₹999.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">GST (18%)</span>
                <span className="font-bold text-slate-800">₹179.82</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                <span className="text-slate-950 font-black">Total Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">₹1,178.82</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">One-time</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500" />
                HD Quality PDF Export
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Dynamic Branding Support
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Unlimited Quotations & Invoices
              </div>
            </div>
          </div>

          {/* Secure Payment Note */}
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Lock size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure 256-Bit Encrypted Payment</span>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessingPayment}
            className={`w-full group relative overflow-hidden flex items-center justify-center gap-3 bg-slate-900 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] ${isProcessingPayment ? 'opacity-90' : ''}`}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Connecting Gateway...
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Pay & Unlock Now
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway Active</span>
          </div>
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPaymentModal;
