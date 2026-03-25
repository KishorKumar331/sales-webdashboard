import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  User, 
  Lock, 
  Mail, 
  Phone,
  Loader2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompanySetupForm } from "./components/CompanySetupForm";
import { useAuthStore } from "../../../store/authStore";

export default function SignUp() {
  const [authState, setAuthState] = useState("register"); // 'register', 'otp', 'setup'
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { setUserEmail, setUserName, setUserPhone, setUserData, setIsAuthenticated, setHasProfile, setLoginTimestamp } = useAuthStore();
  const { checkSession } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullname) {
      alert("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { signUp } = await import('aws-amplify/auth');
      
      await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            name: formData.fullname,
            phone_number: formData.phone,
          }
        }
      });

      setAuthState("otp");
    } catch (error) {
      console.error("Sign up error:", error);
      alert(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    try {
      const { confirmSignUp, signIn } = await import('aws-amplify/auth');
      const result = await confirmSignUp({
        username: formData.email,
        confirmationCode: otp
      });

      if (result.isSignUpComplete || result.nextStep?.signUpStep === 'DONE') {
        // Sign in automatically after verification
        await signIn({
            username: formData.email,
            password: formData.password
        });
        setUserEmail(formData.email);
        setUserName(formData.fullname);
        setUserPhone(formData.phone);
        setLoginTimestamp(Date.now());
        setIsAuthenticated(true);
        setAuthState("setup");
      }
    } catch (error) {
      console.error("OTP error:", error);
      alert(error.message || "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  if (authState === "setup") {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-50">
        <div className="bg-linear-to-r from-purple-600 via-purple-700 to-indigo-800 px-5 py-6 shadow-xl mb-6">
           <h1 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
             <Sparkles className="w-6 h-6 text-yellow-300" />
             Setup Your Company
           </h1>
        </div>
        <CompanySetupForm 
          initialData={{ 
            email: formData.email, 
            fullname: formData.fullname,
            phone: formData.phone
          }} 
          onComplete={(data) => {
            setUserData(data);
            setHasProfile(true);
            navigate("/");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-50 flex flex-col">
      <div className="bg-linear-to-r from-purple-600 via-purple-700 to-indigo-800 px-5 py-6 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-xl text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Create Account</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
          {authState === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
                <p className="text-gray-600">Enter your details to create an account</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20"
                    placeholder="John Doe"
                    value={formData.fullname}
                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20"
                    placeholder="+919999999999"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign Up"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Verify Email</h2>
                <p className="text-gray-600">We've sent a code to {formData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-purple-500/20"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Code"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
