import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Calendar, CreditCard, Search, Filter, MoreVertical, Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, X, User, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Teams = () => {
  const { realUser, setInspectedUser, clearInspectedUser, isInspecting, user: effectiveUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage');
  const [teamMembers, setTeamMembers] = useState([]);
  console.log(teamMembers)
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const loadTeamMembers = React.useCallback(async () => {
    // Check both nested and flat structure to be safe
    const email = realUser?.user?.Email || realUser?.Email;
    if (!email) {
      console.log('Skipping team load - no user email found');
      return;
    }

    try {
      setIsLoading(true);
      const company = realUser?.user?.company || realUser?.company || 'journey_routers';
      const profileUrl = `https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth?company=${encodeURIComponent(company)}&action=billing_status`;
      console.log('Fetching team members from:', profileUrl);

      const response = await axios.get(profileUrl, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Team data received:', response.data);
      if (response.data) {
        const users = Array.isArray(response.data.users) ? response.data.users : (Array.isArray(response.data) ? response.data : []);
        setTeamMembers(users);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      const members = localStorage.getItem('teamMembers');
      if (members) setTeamMembers(JSON.parse(members));
    } finally {
      setIsLoading(false);
    }
  }, [realUser]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const handleSendOtp = async () => {
    if (!newMember.email || !newMember.name || !newMember.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await signUp({
        username: newMember.email,
        password: newMember.password,
        options: {
          userAttributes: {
            email: newMember.email,
            name: newMember.name,
            phone_number: newMember.phone.startsWith('+') ? newMember.phone : `+91${newMember.phone}`,
          }
        }
      });
      setOtpSent(true);
      toast.success(`Verification code sent to ${newMember.email}`);
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to initiate registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmSignUp({
        username: newMember.email,
        confirmationCode: otp
      });

      if (result.isSignUpComplete || result.nextStep?.signUpStep === 'DONE') {
        toast.success('Identity verified successfully! ✨');
        // Automatically proceed to finalize
        await handleFinalizeRegistration();
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      await resendSignUpCode({ username: newMember.email });
      toast.info('New verification code sent');
    } catch (error) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeRegistration = async () => {
    setIsLoading(true);
    try {
      const profileData = {
        FullName: newMember.name,
        Email: newMember.email,
        Phone: newMember.phone,
        company: realUser?.company,
        Role: 'TeamMember',
        Status: 'Active',
        CreatedAt: new Date().toISOString()
      };

      const response = await fetch('https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth?', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        // Now trigger payment flow as per original logic
        const tempMember = { ...profileData, id: Date.now() };
        setSelectedMember(tempMember);
        setShowPaymentModal(true);
        setActiveTab('manage');

        // Reset states
        setNewMember({ name: '', email: '', phone: '', password: '' });
        setOtp('');
        setOtpSent(false);
      } else {
        throw new Error('Failed to register in database');
      }
    } catch (error) {
      console.error("Finalization error:", error);
      toast.error(error.message || "Cloud profile creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Add logic here to update the member's status in your DB
    toast.success('Team member activated! 🚀');
    setShowPaymentModal(false);
    loadTeamMembers(); // Refresh the list from API
  };

  const filteredMembers = teamMembers.filter(member =>
    (member.fullname || member.FullName || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.Email || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInspect = (member) => {
    if (isInspecting && effectiveUser?.user?.Email === member.Email) {
      clearInspectedUser();
      toast.info('Returned to your own profile');
    } else {
      // Wrap member in a user object to match the dashboard's expected structure
      setInspectedUser({ user: member });
      toast.success(`Now inspecting as ${member.fullname || member.Email}`);
      // Redirect to dashboard
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Header Container */}
      <div className="bg-white border-b border-slate-200 px-8 py-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-slate-900 font-black text-3xl tracking-tight leading-none mb-1">Squad Matrix</h1>
              <p className="text-slate-500 text-sm font-medium">Coordinate your team, manage permissions & billing</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start">
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'manage' ? 'bg-white text-purple-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <LayoutGrid size={14} />
              Fleet View
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'add' ? 'bg-white text-purple-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Plus size={14} strokeWidth={3} />
              Recruit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 mt-10">
        {/* Manage Fleet View */}
        {activeTab === 'manage' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Seach by identity, email or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-purple-200 focus:outline-none shadow-sm transition-all text-sm font-medium"
                />
              </div>
              <button
                onClick={loadTeamMembers}
                className="px-6 py-4 bg-purple-50 border-2 border-purple-100 rounded-2xl text-purple-600 font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-purple-100 transition-all shadow-sm"
              >
                Force Refresh
              </button>
              <button className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:border-purple-100 hover:text-purple-600 transition-all shadow-sm">
                <Filter size={18} />
                Sort Operations
              </button>
            </div>

            {isLoading && teamMembers.length === 0 ? (
              <div className="py-40 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-6"></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Core...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-center px-6 transition-all hover:border-purple-200 group">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users size={40} className="text-slate-200" />
                </div>
                <h3 className="text-slate-900 font-black text-2xl mb-2">The Fleet is Empty</h3>
                <p className="text-slate-500 max-w-sm font-medium mb-10">Deploy your first team member to start scaling your operations across the grid.</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-10 py-4 bg-linear-to-r from-purple-600 to-indigo-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-200 hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3"
                >
                  <Plus size={20} strokeWidth={3} />
                  Initiate Recruitment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {teamMembers?.map((member, index) => (
                  <div key={member.Email}>
                    <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 hover:border-purple-100 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-purple-50 group-hover:rotate-3 transition-transform">
                            {member.fullname}
                          </div>
                          {/* <div>
                            <h3 className="text-slate-900 font-black text-xl tracking-tight mb-2 group-hover:text-purple-600 transition-colors uppercase">{member.fullname || member.FullName || 'Standard Agent'}</h3>
                            <div className="space-y-1.5 font-bold text-xs">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Mail size={14} className="text-purple-400" />
                                <span className="truncate max-w-[200px] lowercase">{member.Email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-500">
                                <Phone size={14} className="text-purple-400" />
                                <span>{member.Phone || member.Contact || 'Not Set'}</span>
                              </div>
                            </div>
                          </div> */}
                        </div>
                        <div className="flex flex-col items-end gap-3 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm ring-1 ring-inset ${member.subscription_status === 'active' || member.status === 'active' || member.Status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                            : 'bg-amber-50 text-amber-700 ring-amber-100'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${member.subscription_status === 'active' || member.status === 'active' || member.Status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                            {member.subscription_status || member.Status || member.status || 'Pending'}
                          </span>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Access End</p>
                          <p className="text-slate-900 font-black text-sm tracking-tighter">
                            {member.subscription_end_date ? new Date(member.subscription_end_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-8 pt-8 border-t-2 border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleInspect(member)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isInspecting && effectiveUser?.user?.Email === member.Email
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                              }`}
                          >
                            <Eye size={14} />
                            {isInspecting && effectiveUser?.user?.Email === member.Email ? 'Exit Inspect' : 'Inspect'}
                          </button>
                          {(member.subscription_status !== 'active') && (
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowPaymentModal(true);
                              }}
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                            >
                              <CreditCard size={14} />
                              Pay
                            </button>
                          )}
                          <button className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-400 hover:text-slate-900">
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Member Tab */}
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 border-2 border-white overflow-hidden">
              <div className="bg-linear-to-r from-purple-600 to-indigo-700 p-10 text-white relative">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Users size={120} />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-2">New Recruitment</h2>
                <p className="opacity-80 font-medium">Provisioning a new identity within the <span className="font-bold underline cursor-help" title={realUser?.company}>{realUser?.company || 'Journey Routers'}</span> network.</p>
              </div>

              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-4">Full Identity</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        type="text"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-200 focus:outline-none transition-all font-bold text-sm"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-4">Digital Mail</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-200 focus:outline-none transition-all font-bold text-sm"
                        placeholder="email@company.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-4">Coms Link</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        type="tel"
                        value={newMember.phone}
                        onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-200 focus:outline-none transition-all font-bold text-sm"
                        placeholder="+91 Phone Number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-4">Access Key</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newMember.password}
                        onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-200 focus:outline-none transition-all font-bold text-sm"
                        placeholder="Secure Password"
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="w-full py-5 bg-linear-to-r from-purple-600 to-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-200 hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    Initiate Auth Protocol
                  </button>
                ) : (
                  <div className="space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="space-y-2">
                      <label className="text-center block text-slate-400 text-[10px] font-black uppercase tracking-widest">Confirmation Pulse</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-6 py-6 bg-slate-50 border-2 border-purple-100 rounded-[2rem] text-center text-4xl font-black tracking-[0.5em] text-slate-900 focus:outline-none focus:bg-white transition-all shadow-inner"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <p className="text-center text-[10px] font-bold text-slate-400 mt-3 flex items-center justify-center gap-2">
                        Code transmitted to <span className="text-purple-600 underline">{newMember.email}</span>
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleVerifyOtp}
                        disabled={isLoading}
                        className="flex-1 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                        Verify Code
                      </button>
                      <button
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="px-8 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-6 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Encrypted Pipeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Cognito Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedMember && (
          <PaymentModal
            member={selectedMember}
            onSuccess={() => handlePaymentSuccess()}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedMember(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

/* --- SUPPORTING COMPONENTS --- */

const LayoutGrid = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const PaymentModal = ({ member, onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = () => {
    setIsLoading(true);
    const options = {
      description: `Team Member Access - ${member.FullName}`,
      image: 'https://i.imgur.com/3g7nmJC.png',
      currency: 'INR',
      key: 'rzp_test_S5OVwU720vAaEY',
      amount: '99900',
      name: 'Journey Routers',
      prefill: {
        email: member.Email,
        contact: member.Contact || '',
        name: member.FullName,
      },
      theme: { color: '#7c3aed' },
    };

    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => initializeRazorpay(options);
      document.body.appendChild(script);
    } else {
      initializeRazorpay(options);
    }
  };

  const initializeRazorpay = (options) => {
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    razorpay.on('payment.success', async (response) => {
      onSuccess(member.id, {
        paymentId: response.razorpay_payment_id,
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
    });
    razorpay.on('payment.error', () => {
      toast.error('Payment synchronization failed');
      setIsLoading(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="bg-linear-to-r from-purple-600 to-indigo-700 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <X size={20} />
          </button>
          <h3 className="text-2xl font-black tracking-tight mb-2">Final Activation</h3>
          <p className="opacity-80 text-sm font-medium">Clear the ledger for identity <span className="font-bold underline">#{member.Email}</span></p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Subscription License</span>
              <span className="text-slate-900 font-black text-xl">₹999</span>
            </div>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">One-time provisioning fee for enterprise-grade team member access, unlimited quotation capacity, and real-time CRM synchronization.</p>
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 text-emerald-600 rounded-lg self-start">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Lifetime Access Secured</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={18} strokeWidth={3} />}
            Authorize Payment
          </button>

          <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Encrypted via Razorpay Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default Teams;
