import { useState, useEffect, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";
import axios from "axios";
import { uploadCompanyLogo, uploadPaymentQR } from "../../utils/FileUploadUrl";

export const PersonalInfo = () => {
  const { user } = useAuth();
  const { setUserData } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const isTeamLeader = user?.user?.role === 'teamleader' || user?.user?.role === 'admin' || user?.user?.role === 'teamled';

  const editor = useRef(null);

  const joditConfig = useMemo(() => ({
    readonly: false,
    placeholder: "Describe your cancellation and refund policy...",
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'source', 'fullsize'
    ],
    height: 300,
    theme: 'default',
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_as_html',
  }), []);

  const [profileData, setProfileData] = useState({
    userId: '',
    company: '',
    email: '',
    phone: '',
    fullname: '',
    companyname: '',
    brandname: '',
    tagline: '',
    logourl: '',
    website: '',
    companygstnumber: '',
    pan: '',
    registrationnumber: '',
    taxregion: '',
    supportemail: '',
    billingemail: '',
    officephone: '',
    address: '',
    bankname: '',
    accountnumber: '',
    ifsccode: '',
    branchname: '',
    currency: 'INR',
    upiid: '',
    qrurl: '',
    timezone: 'Asia/Kolkata',
    language: 'en',
    plan: 'premium',
    cancellation: '',
  });

  // Initialize profileData when user data is available
  useEffect(() => {
    if (user) {
      const userData = user.user || {};
      const org = user.organization || {};
      const settings = org.settings || {};
      const contact = org.contact || {};
      const financials = org.financials || {};
      const details = org.details || {};
      const compliance = org.compliance || {};

      setProfileData({
        userId: userData.Email || '',
        company: userData.company || '',
        email: userData.Email || '',
        phone: userData.Phone || '',
        fullname: userData.fullname || '',
        companyname: details.companyname || userData.company || '',
        brandname: details.brandname || '',
        tagline: details.tagline || '',
        logourl: details.logourl || '',
        website: details.website || '',
        gstnumber: compliance.gstnumber || '',
        pan: compliance.pan || '',
        registrationnumber: compliance.registrationnumber || '',
        taxregion: compliance.taxregion || '',
        supportemail: contact.supportemail || userData.Email || '',
        billingemail: contact.billingemail || userData.Email || '',
        officephone: contact.officephone || userData.Phone || '',
        address: contact.address || '',
        bankname: financials.bankname || '',
        accountnumber: financials.accountnumber || '',
        ifsccode: financials.ifsc || '',
        branchname: financials.branch || '',
        currency: financials.currency || 'INR',
        upiid: financials.upiid || '',
        qrurl: financials.qrurl || '',
        timezone: settings.timezone || 'Asia/Kolkata',
        language: settings.language || 'en',
        plan: settings.plan || 'premium',
        cancellation: org?.cancellation || '',
      });
    }
  }, [user]);

  const fetchUpdatedUser = async () => {
    try {
      const response = await axios.get(
        `https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth?Email=${encodeURIComponent(profileData.email)}`
      );
      if (response.data) {
        const updatedUserData = Array.isArray(response.data) ? response.data[0] : response.data;
        setUserData(updatedUserData);
      }
    } catch (err) {
      console.error("Error fetching updated user:", err);
    }
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        Email: profileData.email,
        fullname: profileData.fullname,
        Phone: profileData.phone,
      };

      await axios.put(
        `https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth`,
        payload
      );
      toast.success("Personal information updated successfully!");
      await fetchUpdatedUser();
    } catch (error) {
      console.error("Error updating basic info:", error);
      toast.error("Failed to update personal info.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        company: profileData.company,
        companyname: profileData.companyname,
        brandname: profileData.brandname,
        tagline: profileData.tagline,
        logourl: profileData.logourl,
        website: profileData.website,
        companygstnumber: profileData.companygstnumber,
        pan: profileData.pan,
        registrationnumber: "",
        taxregion: profileData.taxregion,
        supportemail: profileData.supportemail,
        billingemail: profileData.billingemail,
        officephone: profileData.officephone,
        address: profileData.address,
        bankname: profileData.bankname,
        accountnumber: profileData.accountnumber,
        ifsc: profileData.ifsccode,
        branch: profileData.branchname,
        currency: profileData.currency || "INR",
        upiid: profileData.upiid,
        qrurl: profileData.qrurl,
        timezone: profileData.timezone || "Asia/Kolkata",
        language: profileData.language || "en",
        plan: profileData.plan || "premium",
        cancellation: profileData.cancellation,
      };

      await axios.put(
        `https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth`,
        payload
      );
      toast.success("Company profile updated successfully!");
      await fetchUpdatedUser();
    } catch (error) {
      console.error("Error updating company profile:", error);
      toast.error("Failed to update company profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const companyName = profileData.companyname || 'unknown-company';
      const result = await uploadCompanyLogo(file, companyName);
      setProfileData(prev => ({ ...prev, logourl: result.cdn_url }));
      toast.success("Logo uploaded successfully");
    } catch (err) {
      console.error("Logo upload error:", err);
      toast.error("Failed to upload logo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const companyName = profileData.companyname || 'unknown-company';
      const result = await uploadPaymentQR(file, companyName);
      setProfileData(prev => ({ ...prev, qrurl: result.cdn_url }));
      toast.success("QR Code uploaded successfully");
    } catch (err) {
      console.error("QR upload error:", err);
      toast.error("Failed to upload QR code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <form onSubmit={handleBasicSubmit}>
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-lg">01</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={profileData.fullname}
                onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                disabled
                className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Company ID</label>
              <input
                type="text"
                value={profileData.company}
                disabled
                className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Update Personal Info"}
            </button>
          </div>
        </div>
      </form>

      {isTeamLeader && (
        <form onSubmit={handleCompanySubmit}>
          {/* Brand & Organization */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-lg">02</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Brand & Organization</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Company Logo</label>
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('logo-upload').click()}>
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-300">
                    {profileData.logourl ? (
                      <img src={profileData.logourl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                          <span className="text-xl">+</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium tracking-tight">Add Logo</span>
                      </div>
                    )}
                  </div>
                  {profileData.logourl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Change Logo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-1 lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    value={profileData.companyname}
                    disabled
                    className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Brand Name</label>
                  <input
                    type="text"
                    value={profileData.brandname}
                    onChange={(e) => setProfileData({ ...profileData, brandname: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Website</label>
                <input
                  type="text"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Tagline</label>
                <input
                  type="text"
                  value={profileData.tagline}
                  onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Office Address</label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  rows={3}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Compliance & Tax */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-lg">03</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Compliance & Tax</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">GST Number</label>
                <input
                  type="text"
                  value={profileData.companygstnumber}
                  onChange={(e) => setProfileData({ ...profileData, companygstnumber: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">PAN</label>
                <input
                  type="text"
                  value={profileData.pan}
                  onChange={(e) => setProfileData({ ...profileData, pan: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Registration #</label>
                <input
                  type="text"
                  value={profileData.registrationnumber}
                  onChange={(e) => setProfileData({ ...profileData, registrationnumber: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Tax Region</label>
                <input
                  type="text"
                  value={profileData.taxregion}
                  onChange={(e) => setProfileData({ ...profileData, taxregion: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-lg">04</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Contact & Support</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Support Email</label>
                <input
                  type="email"
                  value={profileData.supportemail}
                  onChange={(e) => setProfileData({ ...profileData, supportemail: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Billing Email</label>
                <input
                  type="email"
                  value={profileData.billingemail}
                  onChange={(e) => setProfileData({ ...profileData, billingemail: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Office Phone</label>
                <input
                  type="tel"
                  value={profileData.officephone}
                  onChange={(e) => setProfileData({ ...profileData, officephone: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-lg">05</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Financial Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  value={profileData.bankname}
                  onChange={(e) => setProfileData({ ...profileData, bankname: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Account Number</label>
                <input
                  type="text"
                  value={profileData.accountnumber}
                  onChange={(e) => setProfileData({ ...profileData, accountnumber: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">IFSC Code</label>
                <input
                  type="text"
                  value={profileData.ifsccode}
                  onChange={(e) => setProfileData({ ...profileData, ifsccode: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Branch Name</label>
                <input
                  type="text"
                  value={profileData.branchname}
                  onChange={(e) => setProfileData({ ...profileData, branchname: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">UPI ID</label>
                <input
                  type="text"
                  value={profileData.upiid}
                  onChange={(e) => setProfileData({ ...profileData, upiid: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Currency</label>
                <select
                  value={profileData.currency}
                  onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 cursor-pointer"
                >
                  <option value="INR">Indian Rupee (INR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">QR Code URL</label>
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('qr-upload').click()}>
                  <input
                    type="file"
                    id="qr-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleQRUpload}
                  />
                  <div className="aspect-square w-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-300">
                    {profileData.qrurl ? (
                      <img src={profileData.qrurl} alt="QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase text-center px-4">Add QR</span>
                    )}
                  </div>
                  {profileData.qrurl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl w-32">
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change QR</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-lg">06</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Preferences</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Timezone</label>
                <input
                  type="text"
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Language</label>
                <input
                  type="text"
                  value={profileData.language}
                  onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Plan</label>
                <div className="px-5 py-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-purple-700 uppercase tracking-widest text-xs">{profileData.plan}</span>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Cancellation Policy</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 bg-white">
                  <JoditEditor
                    ref={editor}
                    value={profileData.cancellation}
                    config={joditConfig}
                    tabIndex={1}
                    onBlur={(newContent) => setProfileData(prev => ({ ...prev, cancellation: newContent }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-8">
            <button
              type="button"
              className="px-8 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Update Company Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};