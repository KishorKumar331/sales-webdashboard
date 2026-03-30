import React from 'react';
import { CompanySetupForm } from './SignUp/components/CompanySetupForm';
import { useAuthStore } from '../../store/authStore';
import { Sparkles } from 'lucide-react';

const CreateProfile = () => {
  const { userEmail, userData, setUserData, setHasProfile } = useAuthStore();

  // Use userData if available, otherwise fallback to stored email
  const initialFormValues = {
    email: userData?.Email || userData?.email || userEmail,
    phone: userData?.phone || userData?.phone_number || "",
    fullname: userData?.fullname || userData?.name || ""
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-50">
      <div className="bg-linear-to-r from-purple-600 via-purple-700 to-indigo-800 px-5 py-6 shadow-xl mb-6">
        <h1 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          Setup Your Business Profile
        </h1>
      </div>
      <div className="p-6">
        <CompanySetupForm
          initialData={initialFormValues}
          onComplete={(fullUserData) => {
            if (fullUserData) {
              setUserData(fullUserData);
              setHasProfile(true);
              // Router in App.jsx will automatically handle redirect to / once hasProfile is true
            }
          }}
        />
      </div>
    </div>
  );
};

export default CreateProfile;
