import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";
import axios from "axios";

export const PersonalInfo = () => {
  const { user } = useAuth();
  const { setUserData, userId } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    companyId: '',
    email: '',
    phone: '',
    fullName: '',
    companyName: '',
    brandName: '',
    tagline: '',
    logoUrl: null,
    website: '',
    companyGstNumber: '',
    pan: '',
    registrationNumber: '',
    taxRegion: '',
    supportEmail: '',
    billingEmail: '',
    officePhone: '',
    address: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    currency: 'INR',
    upiId: '',
    qrUrl: null,
    timezone: 'Asia/Kolkata',
    language: 'en',
    plan: 'premium',
  });

  // Initialize profileData when user data is available
  useEffect(() => {
    if (user) {
      const org = user.organization || {};
      const settings = org.settings || {};
      const contact = org.contact || {};
      const financials = org.financials || {};
      const details = org.details || {};
      const compliance = org.compliance || {};

      setProfileData({
        companyId: user.CompanyId || '',
        email: user.Email || '',
        phone: user.Phone || '',
        fullName: user.FullName || '',
        companyName: details.companyname || '',
        brandName: details.brandname || '',
        tagline: details.tagline || '',
        logoUrl: details.logourl || null,
        website: details.website || '',
        companyGstNumber: compliance.gstnumber || '',
        pan: compliance.pan || '',
        registrationNumber: compliance.registrationnumber || '',
        taxRegion: compliance.taxregion || '',
        supportEmail: contact.supportemail || '',
        billingEmail: contact.billingemail || '',
        officePhone: contact.officephone || '',
        address: contact.address || '',
        bankName: financials.bankname || '',
        accountNumber: financials.accountnumber || '',
        ifscCode: financials.ifsc || '',
        branchName: financials.branch || '',
        currency: financials.currency || 'INR',
        upiId: financials.upiid || '',
        qrUrl: financials.qrurl || null,
        timezone: settings.timezone || 'Asia/Kolkata',
        language: settings.language || 'en',
        plan: settings.plan || 'premium',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        userId: userId,
        CompanyId: profileData.companyId,
        Email: profileData.email,
        FullName: profileData.fullName,
        Phone: profileData.phone,
        organization: {
          settings: {
            language: profileData.language,
            timezone: profileData.timezone,
            plan: profileData.plan,
          },
          contact: {
            officephone: profileData.officePhone,
            address: profileData.address,
            billingemail: profileData.billingEmail,
            supportemail: profileData.supportEmail,
          },
          financials: {
            accountnumber: profileData.accountNumber,
            qrurl: profileData.qrUrl,
            currency: profileData.currency,
            bankname: profileData.bankName,
            ifsc: profileData.ifscCode,
            upiid: profileData.upiId,
            branch: profileData.branchName,
          },
          details: {
            tagline: profileData.tagline,
            website: profileData.website,
            brandname: profileData.brandName,
            companyname: profileData.companyName,
            logourl: profileData.logoUrl,
          },
          compliance: {
            gstnumber: profileData.companyGstNumber,
            pan: profileData.pan,
            registrationnumber: profileData.registrationNumber,
            taxregion: profileData.taxRegion,
          }
        }
      };

      await axios.put(
        `https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth?Email=${encodeURIComponent(user.Email)}`,
        payload
      );

      toast.success("Profile updated successfully!");

      // Fetch updated user data and update auth store
      try {
        const updatedUserResponse = await axios.get(
          `https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth?Email=${encodeURIComponent(user.Email)}`
        );
        
        if (updatedUserResponse.data) {
          const updatedUserData = Array.isArray(updatedUserResponse.data) 
            ? updatedUserResponse.data[0] 
            : updatedUserResponse.data;
          setUserData(updatedUserData);
        }
      } catch (fetchError) {
        console.error("Error fetching updated user data:", fetchError);
        // Still show success even if fetch fails, as profile was updated
      }

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-lg">01</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Logo</label>
              <div className="relative group">
                <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-purple-300">
                  {profileData.logoUrl ? (
                    <img src={profileData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                        <span className="text-xl">+</span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium tracking-tight">Add Logo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
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
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Company ID</label>
                <input
                  type="text"
                  value={profileData.companyId}
                  disabled
                  className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand & Organization */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-lg">02</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Brand & Organization</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                value={profileData.companyName}
                onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Brand Name</label>
              <input
                type="text"
                value={profileData.brandName}
                onChange={(e) => setProfileData({...profileData, brandName: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Website</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Tagline</label>
              <input
                type="text"
                value={profileData.tagline}
                onChange={(e) => setProfileData({...profileData, tagline: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Office Address</label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
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
                value={profileData.companyGstNumber}
                onChange={(e) => setProfileData({...profileData, companyGstNumber: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">PAN</label>
              <input
                type="text"
                value={profileData.pan}
                onChange={(e) => setProfileData({...profileData, pan: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Registration #</label>
              <input
                type="text"
                value={profileData.registrationNumber}
                onChange={(e) => setProfileData({...profileData, registrationNumber: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Tax Region</label>
              <input
                type="text"
                value={profileData.taxRegion}
                onChange={(e) => setProfileData({...profileData, taxRegion: e.target.value})}
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
                value={profileData.supportEmail}
                onChange={(e) => setProfileData({...profileData, supportEmail: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Billing Email</label>
              <input
                type="email"
                value={profileData.billingEmail}
                onChange={(e) => setProfileData({...profileData, billingEmail: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Office Phone</label>
              <input
                type="tel"
                value={profileData.officePhone}
                onChange={(e) => setProfileData({...profileData, officePhone: e.target.value})}
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
                value={profileData.bankName}
                onChange={(e) => setProfileData({...profileData, bankName: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Account Number</label>
              <input
                type="text"
                value={profileData.accountNumber}
                onChange={(e) => setProfileData({...profileData, accountNumber: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">IFSC Code</label>
              <input
                type="text"
                value={profileData.ifscCode}
                onChange={(e) => setProfileData({...profileData, ifscCode: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Branch Name</label>
              <input
                type="text"
                value={profileData.branchName}
                onChange={(e) => setProfileData({...profileData, branchName: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">UPI ID</label>
              <input
                type="text"
                value={profileData.upiId}
                onChange={(e) => setProfileData({...profileData, upiId: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Currency</label>
              <select
                value={profileData.currency}
                onChange={(e) => setProfileData({...profileData, currency: e.target.value})}
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
              <div className="relative group">
                <div className="aspect-square w-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-300">
                  {profileData.qrUrl ? (
                    <img src={profileData.qrUrl} alt="QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold uppercase text-center px-4">Add QR</span>
                  )}
                </div>
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
                onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Language</label>
              <input
                type="text"
                value={profileData.language}
                onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                className="w-full px-5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Plan</label>
              <div className="px-5 py-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                <span className="font-bold text-purple-700 uppercase tracking-widest text-xs">{profileData.plan}</span>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="mt-10 flex items-center justify-end gap-4 border-t border-gray-100 pt-8">
          <button 
            type="button"
            className="px-8 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-10 py-3.5 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving Changes..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};