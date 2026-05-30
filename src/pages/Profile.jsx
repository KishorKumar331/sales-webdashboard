import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { PersonalInfo } from "./(profile)/PersonalInfo";
import MarketplacePreviewModal from '../components/modals/MarketplacePreviewModal';
import PremiumPaymentModal from '../components/modals/PremiumPaymentModal';
import {
  User,
  CreditCard,
  ShoppingCart,
  FileText,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Package,
  DollarSign,
  FileDown,
  FileUp,
  Globe,
  Lock,
  Key,
  LogOut,
  Sparkles,
  Zap
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  console.log(user)
  const { logout } = useAuth();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || 'personal');

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (tabId) => {
    navigate(`/profile/${tabId}`);
  };
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
    { id: 2, type: 'card', last4: '5555', brand: 'Mastercard', isDefault: false },
  ]);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'payment', message: 'Payment received from John Doe', time: '2 hours ago', read: false },
    { id: 2, type: 'system', message: 'Your subscription will renew in 5 days', time: '1 day ago', read: true },
  ]);
  const [marketTemplates, setMarketTemplates] = useState([]);
  const [templateType, setTemplateType] = useState('quotation'); // 'invoice' or 'quotation'
  const [activeTemplates, setActiveTemplates] = useState({
    invoice: user?.preferences?.invoicepdf || user?.invoicepdf || user?.Preference?.invoicepdf || null,
    quotation: user?.preferences?.quotationpdf || user?.quotationpdf || user?.Preference?.quotationpdf || null
  });
  const [fetchingTemplates, setFetchingTemplates] = useState(false);
  const [showMarketplacePreview, setShowMarketplacePreview] = useState(false);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null);

  const handlePaymentSuccess = async (paymentResponse) => {
    if (!pendingTemplate) return;

    setFetchingTemplates(true);
    try {
      const isInvoice = templateType === 'invoice';

      // Define default hashes from user request if current ones are missing
      const defaultInvoice = user?.organization?.preferences?.invoicepdf;
      const defaultQuotation = user?.organization?.preferences?.quotationpdf;

      const updatedUser = {
        Email: user?.user?.adminemailid,
        company: user?.user?.company || '',
        invoicepdf: isInvoice ? pendingTemplate.name : (activeTemplates.invoice || defaultInvoice),
        quotationpdf: !isInvoice ? pendingTemplate.name : (activeTemplates.quotation || defaultQuotation)
      };

      console.log('🔥 Updating profile templates after payment:', updatedUser);
      console.log('Razorpay Payment ID:', paymentResponse.razorpay_payment_id);

      const response = await axios.put('https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth', updatedUser);

      if (response.status === 200 || response.status === 204) {
        setActiveTemplates(prev => ({
          ...prev,
          [templateType]: pendingTemplate.name
        }));

        toast.success(`Active ${templateType} template updated successfully!`);
        setShowPaymentModal(false);
        setPendingTemplate(null);

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Failed to update template');
      }
    } catch (error) {
      console.error('Error setting template:', error);
      toast.error('Failed to update template. Please contact support.');
    } finally {
      setFetchingTemplates(false);
    }
  };

  const handleSetTemplate = (template) => {
    const userEmail = user?.user?.Email;
    if (!userEmail) {
      toast.error('User not authenticated. Please log in again.');
      return;
    }
    setPendingTemplate(template);
    setShowPaymentModal(true);
  };

  useEffect(() => {
    if (user) {
      setActiveTemplates({
        invoice: user?.preferences?.invoicepdf || user?.invoicepdf || user?.Preference?.invoicepdf || null,
        quotation: user?.preferences?.quotationpdf || user?.quotationpdf || user?.Preference?.quotationpdf || null
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchTemplates = async () => {
      setFetchingTemplates(true);
      try {
        const response = await axios.get('https://plans.infinitepackages.com/design-builder/min-info.json');
        setMarketTemplates(response.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setFetchingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
  ];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const addPaymentMethod = () => {
    const newMethod = {
      id: paymentMethods.length + 1,
      type: 'card',
      last4: '0000',
      brand: 'New Card',
      isDefault: false
    };
    setPaymentMethods([...paymentMethods, newMethod]);
  };

  const setDefaultPayment = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const deletePaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };
  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  // Payment Tab
  const renderPayment = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <button
            onClick={addPaymentMethod}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>

        <div className="space-y-4">
          {paymentMethods.map(method => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <CreditCard className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">{method.brand} ending in {method.last4}</p>
                  {method.isDefault && <span className="text-xs text-green-600 font-medium">Default</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => setDefaultPayment(method.id)}
                    className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => deletePaymentMethod(method.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing History</h3>
        <div className="space-y-4">
          {[
            { date: '2024-01-15', amount: 99, status: 'paid', description: 'Pro Plan Subscription' },
            { date: '2023-12-15', amount: 99, status: 'paid', description: 'Pro Plan Subscription' },
            { date: '2023-11-15', amount: 99, status: 'paid', description: 'Pro Plan Subscription' },
          ].map((bill, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{bill.description}</p>
                <p className="text-sm text-gray-500">{bill.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-900">${bill.amount}</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Paid</span>
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Marketplace Tab
  const renderMarketplace = () => {
    const filteredTemplates = marketTemplates.filter(t =>
      templateType === 'invoice' ? t.type === 'invoice' : t.type !== 'invoice'
    );

    const groupedTemplates = filteredTemplates.reduce((acc, template) => {
      const category = template.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(template);
      return acc;
    }, {});


    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-purple-100/50 border border-white/60 p-8 relative overflow-hidden">
          {/* Animated background accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-200">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Design Studio</h3>
              </div>
              <p className="text-slate-500 font-medium ml-12">Elevate your brand with premium document architecture</p>
            </div>

            <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl w-full lg:w-auto border border-slate-200/50">
              <button
                onClick={() => setTemplateType('quotation')}
                className={`flex-1 lg:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${templateType === 'quotation'
                  ? 'bg-white text-purple-600 shadow-xl scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
              >
                Quotations
              </button>
              <button
                onClick={() => setTemplateType('invoice')}
                className={`flex-1 lg:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${templateType === 'invoice'
                  ? 'bg-white text-purple-600 shadow-xl scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
              >
                Invoices
              </button>
            </div>
          </div>

          {fetchingTemplates ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-8 h-8 text-purple-600 animate-bounce" />
                </div>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-8">Synchronizing Assets...</p>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupedTemplates).map(([category, templates]) => (
                <div key={category} className="space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] whitespace-nowrap bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100">{category}</span>
                    <div className="h-px flex-1 bg-linear-to-r from-purple-100 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {templates.map((template, idx) => {
                      const isActive = activeTemplates[templateType] === template.name;
                      return (
                        <div
                          key={idx}
                          className={`group relative bg-white rounded-[2rem] p-6 transition-all duration-500 border-2 ${isActive
                            ? 'border-purple-600 shadow-2xl shadow-purple-100 -translate-y-2'
                            : 'border-slate-50 hover:border-purple-200 hover:shadow-xl hover:-translate-y-2'
                            }`}
                        >
                          {/* Card Header */}
                          <div className="flex justify-between items-start mb-8">
                            <div className={`p-4 rounded-2xl transition-all duration-500 ${isActive ? 'bg-purple-600 text-white shadow-lg rotate-3' : 'bg-slate-50 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 group-hover:rotate-6'}`}>
                              <FileText className="w-6 h-6" />
                            </div>
                            {isActive ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                                  <Check className="w-3 h-3" strokeWidth={3} />
                                  Live Instance
                                </span>
                              </div>
                            ) : (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-100">
                                  Ready to Deploy
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="mb-8">
                            <h4 className="text-xl font-black text-slate-900 group-hover:text-purple-600 transition-colors tracking-tight mb-2 uppercase">
                              {template.original_name.replace('.hbs', '').replace(/_/g, ' ')}
                            </h4>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Globe className="w-3 h-3" />
                              <p className="text-[10px] font-bold uppercase tracking-widest">
                                Global Standard • v2.0
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handlePreviewTemplate(template)}
                              className="flex-1 px-4 py-3.5 text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                              title="Preview Digital Proof"
                            >
                              <Eye className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                              <span className="text-xs font-black uppercase tracking-widest">Proof</span>
                            </button>

                            {!isActive ? (
                              <button
                                onClick={() => handleSetTemplate(template)}
                                disabled={fetchingTemplates}
                                className="flex-1 px-4 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <span className="text-xs font-black uppercase tracking-widest">Deploy</span>
                                <Plus className="w-4 h-4" strokeWidth={3} />
                              </button>
                            ) : (
                              <button
                                className="flex-1 px-4 py-3.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 cursor-default"
                                disabled
                              >
                                <Check className="w-4 h-4" strokeWidth={3} />
                                <span className="text-xs font-black uppercase tracking-widest">Active</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                    <ShoppingCart className="w-10 h-10 text-slate-200" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">Zero Assets Found</h4>
                  <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">Our design engine couldn't locate any {templateType} templates in the selected cloud category.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Design Banner */}
        <div className="group bg-linear-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-indigo-200/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] group-hover:bg-purple-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-6 backdrop-blur-md">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Enterprise Solutions</span>
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tight leading-none italic">Bespoke Brand<br />Architecture?</h3>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Unlock exclusive identity design. Our expert studio can engineer a custom template ecosystem tailored perfectly to your unique brand DNA.
              </p>
            </div>
            <button className="whitespace-nowrap px-10 py-5 bg-white text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-purple-50 transition-all transform hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3 group/btn">
              Consult Studio
              <TrendingUp className="w-4 h-4 text-purple-600 transition-transform group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplateForPreview(template);
    setShowMarketplacePreview(true);
  };

  // Documents Tab
  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Document Management</h3>
          <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Documents
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {[
            { name: 'Travel Brochure 2024.pdf', size: '2.4 MB', date: '2024-01-10', type: 'PDF' },
            { name: 'Company Profile.docx', size: '1.2 MB', date: '2024-01-08', type: 'DOCX' },
            { name: 'Price List.xlsx', size: '856 KB', date: '2024-01-05', type: 'XLSX' },
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.size} • {doc.date} • {doc.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Security Tab
  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <Lock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Last changed 30 days ago</p>
              </div>
            </div>
            <button className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
              Update
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <Key className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Enable
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Login Alerts</p>
                <p className="text-sm text-gray-500">Get notified of new login attempts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Sessions</h3>
        <div className="space-y-4">
          {[
            { device: 'Chrome on Windows', location: 'New York, USA', time: 'Current', isCurrent: true },
            { device: 'Safari on iPhone', location: 'Boston, USA', time: '2 hours ago', isCurrent: false },
            { device: 'Firefox on Mac', location: 'Los Angeles, USA', time: '1 day ago', isCurrent: false },
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <Globe className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">{session.device}</p>
                  <p className="text-sm text-gray-500">{session.location} • {session.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.isCurrent && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Current</span>}
                {!session.isCurrent && (
                  <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    Terminate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Notifications Tab
  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          <button className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
            Mark all as read
          </button>
        </div>

        <div className="space-y-4">
          {notifications.map(notif => (
            <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-lg border ${notif.read ? 'border-gray-200 bg-gray-50' : 'border-purple-200 bg-purple-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.type === 'payment' ? 'bg-green-100' : 'bg-blue-100'}`}>
                {notif.type === 'payment' ?
                  <DollarSign className="w-4 h-4 text-green-600" /> :
                  <Bell className="w-4 h-4 text-blue-600" />
                }
              </div>
              <div className="flex-1">
                <p className={`font-medium ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.message}</p>
                <p className="text-sm text-gray-500 mt-1">{notif.time}</p>
              </div>
              <div className="flex items-center gap-2">
                {!notif.read && (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { label: 'Payment notifications', description: 'Get notified about payments and invoices', enabled: true },
            { label: 'System updates', description: 'Receive important system announcements', enabled: true },
            { label: 'Marketing emails', description: 'Promotional offers and product updates', enabled: false },
            { label: 'Team activities', description: 'Updates from your team members', enabled: true },
          ].map((pref, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{pref.label}</p>
                <p className="text-sm text-gray-500">{pref.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={pref.enabled} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Settings Tab
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option>Eastern Time (ET)</option>
              <option>Central Time (CT)</option>
              <option>Mountain Time (MT)</option>
              <option>Pacific Time (PT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h3>
        <div className="space-y-4">
          {[
            { label: 'Profile visibility', description: 'Make your profile visible to other users', enabled: true },
            { label: 'Show email address', description: 'Display email in your public profile', enabled: false },
            { label: 'Show phone number', description: 'Display phone in your public profile', enabled: false },
            { label: 'Analytics tracking', description: 'Help us improve by sharing usage data', enabled: true },
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={setting.enabled} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Help Tab
  const renderHelp = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Help Center</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Getting Started', description: 'Learn the basics of Quick Quotes', icon: Package },
            { title: 'Billing & Payments', description: 'Manage subscriptions and payments', icon: CreditCard },
            { title: 'Account Settings', description: 'Configure your account preferences', icon: Settings },
            { title: 'Security & Privacy', description: 'Keep your account secure', icon: Shield },
          ].map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <item.icon className="w-6 h-6 text-purple-600" />
                <h4 className="font-medium text-gray-900">{item.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: 'How do I upgrade my subscription?', a: 'Go to Payment tab and select your desired plan.' },
            { q: 'Can I export my data?', a: 'Yes, you can export all your data from the Documents section.' },
            { q: 'How do I contact support?', a: 'Use the contact form below or email support@Quick Quotes.com' },
            { q: 'Is my data secure?', a: 'Yes, we use industry-standard encryption and security measures.' },
          ].map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900">{faq.q}</span>
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Support</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              placeholder="How can we help?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea
            rows={4}
            placeholder="Describe your issue in detail..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return <PersonalInfo />;
      case 'payment': return renderPayment();
      case 'marketplace': return renderMarketplace();
      default: return <PersonalInfo />;
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {loading ? 'Loading...' : (user?.user?.fullname || user?.username || 'Adminwww User')}
            </p>

          </div>
          <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {loading ? '?' : ((user?.user?.fullname || user?.user?.fullname || 'Admin User').split(' ').map(n => n[0]).join(''))}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 cursor-pointer py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-xl shadow-purple-200 scale-105'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Marketplace Preview Modal */}
      <MarketplacePreviewModal
        visible={showMarketplacePreview}
        onClose={() => setShowMarketplacePreview(false)}
        templateName={selectedTemplateForPreview?.name}
        type={templateType}
      />

      {/* Premium Payment Modal */}
      <PremiumPaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        templateName={pendingTemplate?.name}
        type={templateType}
        userDetails={user?.user}
      />
    </div>
  );
};

export default Profile;
