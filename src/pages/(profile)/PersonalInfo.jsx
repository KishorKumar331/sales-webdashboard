import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";
import axios from "axios";

export const PersonalInfo = () => {
  const { user } = useAuth();
  const { setUserData } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    companyAddress: '',
    companyGSTNumber: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    ifscCode: '',
  });

  // Initialize profileData when user data is available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.FullName || '',
        email: user.Email || '',
        phone: user.Phone || '',
        company: user.CompanyName || '',
        companyAddress: user.CompanyAddress || '',
        companyGSTNumber: user.CompanyGSTNumber || '',
        bankName: user.BankName || '',
        branchName: user.BranchName || '',
        accountNumber: user.AccountNumber || '',
        ifscCode: user.IfscCode || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.put(
        `https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth?Email=${encodeURIComponent(user.Email)}`,
        {
          FullName: profileData.name,
          CompanyName: profileData.company,
          CompanyAddress: profileData.companyAddress,
          CompanyGSTNumber: profileData.companyGSTNumber,
          Phone: profileData.phone,
          AccountNumber: profileData.accountNumber,
          BankName: profileData.bankName,
          BranchName: profileData.branchName,
          IfscCode: profileData.ifscCode,
          Email: user.Email
        }
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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={profileData.company}
                onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
              <input
                type="text"
                value={profileData.companyAddress}
                onChange={(e) => setProfileData({...profileData, companyAddress: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company GST Number</label>
              <input
                type="text"
                value={profileData.companyGSTNumber}
                onChange={(e) => setProfileData({...profileData, companyGSTNumber: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={profileData.bankName}
                onChange={(e) => setProfileData({...profileData, bankName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
              <input
                type="text"
                value={profileData.branchName}
                onChange={(e) => setProfileData({...profileData, branchName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={profileData.accountNumber}
                onChange={(e) => setProfileData({...profileData, accountNumber: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
              <input
                type="text"
                value={profileData.ifscCode}
                onChange={(e) => setProfileData({...profileData, ifscCode: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};