import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  X, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Globe,
  Star,
  ChevronRight,
  Mail,
  Phone,
  User,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';
import { fetchAuthSession, getCurrentUser, signOut } from "aws-amplify/auth";
import { CompanySetupForm } from './SignUp/components/CompanySetupForm';


const OnBoardingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [authState, setAuthState] = useState('login'); // 'login', 'signup', 'forgot_password', 'confirm_reset', 'setup_company'
  const navigate = useNavigate();
  
  // Get Zustand store actions
  const { setUserEmail, setUserName, setUserPhone, setUserData, setIsAuthenticated, setHasProfile, setLoginTimestamp, userEmail, userName, userPhone, isAuthenticated, loginTimestamp } = useAuthStore();
  const { checkSession, resetPassword, confirmResetPassword } = useAuth();

  // PROFILE_API constant
  const PROFILE_API = 'https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth?';

  useEffect(() => {
    if (isAuthenticated && userEmail && authState !== 'setup_company') {
      const fetchProfileData = async () => {
        try {
          const profileUrl = `${PROFILE_API}Email=${encodeURIComponent(userEmail)}`;
          
          const response = await fetch(profileUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const profileData = await response.json();
            console.log('🔥 OnBoarding: Profile API response:', profileData);
            
            // Set user data in store
            const userData = Array.isArray(profileData) ? profileData[0] : profileData;
            if (userData) {
              setUserData(userData);
              console.log('🔥 OnBoarding: User data set in store:', userData);
            } else {
              setAuthState('setup_company');
            }
          } else if (response.status === 404) {
             setAuthState('setup_company');
          } else {
            console.log('🔥 OnBoarding: Profile API failed:', response.status);
          }
        } catch (apiError) {
          console.error('🔥 OnBoarding: Profile API error:', apiError);
        }
      };

      fetchProfileData();
    }
  }, [isAuthenticated, userEmail, setUserData, authState]);
  
  // Enhanced carousel data with better content
  const carouselData = [
    { 
      id: 1, 
      title: "Welcome to Quick Quotes", 
      subtitle: "Your Complete Sales Management Solution",
      description: "Streamline your sales process with our powerful tools",
      bgColor: "from-purple-500 to-purple-700",
      icon: <TrendingUp className="w-12 h-12" />,
      features: ["Track leads", "Manage quotes", "Analytics dashboard"]
    },
    { 
      id: 2, 
      title: "Smart Lead Management", 
      subtitle: "Never miss a potential customer",
      description: "Organize and track all your leads in one place",
      bgColor: "from-blue-500 to-blue-700",
      icon: <Users className="w-12 h-12" />,
      features: ["Lead scoring", "Follow-up reminders", "Contact management"]
    },
    { 
      id: 3, 
      title: "Powerful Analytics", 
      subtitle: "Data-driven insights for growth",
      description: "Make informed decisions with real-time analytics",
      bgColor: "from-green-500 to-green-700",
      icon: <Globe className="w-12 h-12" />,
      features: ["Sales reports", "Performance metrics", "Revenue tracking"]
    },
    { 
      id: 4, 
      title: "Secure & Reliable", 
      subtitle: "Enterprise-grade security",
      description: "Your data is safe with our advanced security features",
      bgColor: "from-indigo-500 to-indigo-700",
      icon: <Shield className="w-12 h-12" />,
      features: ["Data encryption", "Secure backups", "Role-based access"]
    },
    { 
      id: 5, 
      title: "Start Your Journey", 
      subtitle: "Join thousands of successful businesses",
      description: "Transform your sales process today",
      bgColor: "from-pink-500 to-pink-700",
      icon: <Zap className="w-12 h-12" />,
      features: ["Free trial", "Easy setup", "24/7 support"]
    }
  ];

  const handleScroll = (event) => {
    const scrollPosition = event.target.scrollLeft;
    const index = Math.round(scrollPosition / window.innerWidth);
    setCurrentIndex(index);
  };

  const showToast = (message, type = 'success') => {
    toast(message, {
      type: type,
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };



  const handleAuth = async () => {
    if (authState === 'login') {
      await handleLogin();
    } else if (authState === 'forgot_password') {
      await handleForgotPasswordRequest();
    } else if (authState === 'confirm_reset') {
      await handleConfirmReset();
    } else {
      await handleSignup();
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!loginInput.trim()) {
      showToast('Please enter your email or phone number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const output = await resetPassword({ username: loginInput });
      console.log('🔥 Reset password output:', output);
      showToast('Confirmation code sent to your email');
      setAuthState('confirm_reset');
    } catch (error) {
      showToast(error.message || 'Failed to send reset code', 'error');
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!confirmationCode.trim() || !password.trim()) {
      showToast('Please enter the confirmation code and new password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await confirmResetPassword({
        username: loginInput,
        confirmationCode,
        newPassword: password
      });
      showToast('Password reset successful! You can now login.');
      setAuthState('login');
      setPassword('');
      setConfirmationCode('');
    } catch (error) {
      showToast(error.message || 'Failed to reset password', 'error');
      console.error('Confirm reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginInput.trim() || !password.trim()) {
      showToast('Please enter your email/phone and password', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Import here to avoid top-level import issues if not needed globally
      const { signIn, signOut, fetchUserAttributes } = await import('aws-amplify/auth');
      
      let signInResult;
      try {
        signInResult = await signIn({
          username: loginInput,
          password,
        });
      } catch (signInError) {
        // If already signed in, force logout and retry
        if (signInError.name === 'UserAlreadyAuthenticatedException' || 
            signInError.message?.includes('already signed in')) {
          await signOut();
          signInResult = await signIn({
            username: loginInput,
            password,
          });
        } else {
          throw signInError;
        }
      }

      const { isSignedIn, nextStep } = signInResult;

      if (isSignedIn) {
        showToast('Login successful!');
        
        // Fetch Cognito attributes to get name and phone
        const attributes = await fetchUserAttributes();
        const cognitoName = attributes.name || "";
        const cognitoPhone = attributes.phone_number || "";

        setUserEmail(loginInput);
        setUserName(cognitoName);
        setUserPhone(cognitoPhone);
        setLoginTimestamp(Date.now());
        
        // Check profile
        try {
          const profileUrl = `${PROFILE_API}Email=${encodeURIComponent(loginInput)}`;
          const response = await fetch(profileUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (response.ok) {
            const profileData = await response.json();
            const userData = Array.isArray(profileData) ? profileData[0] : profileData;
            
            if (userData) {
              setUserData(userData);
              setIsAuthenticated(true);
              if (userData.phone) setUserPhone(userData.phone);
              setShowLoginModal(false);
              navigate('/');
            } else {
              setAuthState('setup_company');
              setIsAuthenticated(true);
              // Store fullname temporarily if we want to pass to setup form
              // Since we don't have a setFullname, we'll rely on passing it via props to CompanySetupForm
              setShowLoginModal(false);
            }
          } else {
            setAuthState('setup_company');
            setIsAuthenticated(true);
            setShowLoginModal(false);
          }
        } catch (apiError) {
           setAuthState('setup_company');
           setIsAuthenticated(true);
           setShowLoginModal(false);
        }
      } else {
         showToast(`Login step required: ${nextStep.signInStep}`, 'info');
      }

    } catch (error) {
      showToast(error.message || 'Login failed. Please check your credentials.', 'error');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!loginInput.trim()) {
      showToast('Please enter your email or phone number', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Navigate to signup page with pre-filled data
      setShowLoginModal(false);
      navigate('/signup');
    } catch (error) {
      showToast('Error redirecting to signup. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  const goToSlide = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        left: window.innerWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => {
    if (currentIndex < carouselData.length - 1) {
      goToSlide(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  };

  if (authState === 'setup_company') {
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
            initialData={{ email: userEmail, phone: userPhone, fullname: userName }} 
            onComplete={(fullUserData) => {
              if (fullUserData) {
                setUserData(fullUserData);
                setHasProfile(true);
                if (fullUserData.phone) setUserPhone(fullUserData.phone);
                navigate('/');
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-b-3xl px-5 py-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <h1 className="text-2xl font-bold text-white">Quick Quotes</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setShowLoginModal(true);
                setAuthState('login');
              }} 
              className="px-6 py-2.5 rounded-xl bg-white/20 text-white font-medium hover:bg-white/30 transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Login
            </button>
            <button 
              onClick={() => {
                setShowLoginModal(true);
                setAuthState('signup');
              }} 
              className="px-6 py-2.5 rounded-xl bg-white text-purple-700 font-medium hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <User className="w-4 h-4" />
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Carousel */}
      <div style={{overflow:'hidden'}} className="relative h-[calc(100vh-120px)] ">
        <div
        style={{overflow:'hidden'}}
          ref={scrollViewRef}
          className="flex h-full overflow-x-auto  snap-x snap-mandatory scroll-smooth"
          onScroll={handleScroll}
        >
          {carouselData.map((item, index) => (
            <div 
              key={item.id} 
              className="w-full flex-shrink-0 snap-start px-5 flex items-center justify-center"
              style={{ width: '100%' }}
            >
              <div className="max-w-4xl mx-auto text-center">
                {/* Icon with animation */}
                <div className={`mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${item.bgColor} shadow-2xl transform transition-all duration-500 ${
                  index === currentIndex ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
                }`}>
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {item.title}
                </h2>
                <p className="text-xl text-purple-600 font-semibold mb-4">
                  {item.subtitle}
                </p>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  {item.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {item.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-100"
                    >
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setAuthState('signup');
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Get Started Free
                  </button>
                  <button
                    onClick={nextSlide}
                    className="px-8 py-4 bg-white text-purple-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-purple-200 flex items-center justify-center gap-2"
                  >
                    Learn More
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-between px-5">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`p-3 rounded-xl transition-all duration-200 ${
              currentIndex === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl'
            }`}
          >
            <ArrowRight className="w-6 h-6 rotate-180" />
          </button>

          {/* Enhanced Dots */}
          <div className="flex items-center gap-3">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-10 h-3 bg-purple-600 rounded-full shadow-lg' 
                    : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentIndex === carouselData.length - 1}
            className={`p-3 rounded-xl transition-all duration-200 ${
              currentIndex === carouselData.length - 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl'
            }`}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Enhanced Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {authState === 'login' ? 'Welcome Back' : 
                   authState === 'signup' ? 'Create Account' : 
                   authState === 'forgot_password' ? 'Reset Password' : 'Confirm Reset'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {authState === 'login' ? 'Sign in to continue to Quick Quotes' : 
                   authState === 'signup' ? 'Start your free trial today' : 
                   authState === 'forgot_password' ? 'Enter your email to receive a code' : 'Enter the code sent to your email'}
                </p>
              </div>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tab Toggle */}
            {(authState === 'login' || authState === 'signup') && (
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setAuthState('login')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    authState === 'login' 
                      ? 'bg-white text-purple-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthState('signup')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    authState === 'signup' 
                      ? 'bg-white text-purple-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email or Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Enter your email or phone"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
                    disabled={isLoading || authState === 'confirm_reset'}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    {isValidEmail(loginInput) ? (
                      <Mail className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Phone className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {authState === 'confirm_reset' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Confirmation Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      placeholder="Enter verification code"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
                      disabled={isLoading}
                    />
                    <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              )}

              {(authState === 'login' || authState === 'confirm_reset') && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {authState === 'confirm_reset' ? 'New Password' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authState === 'confirm_reset' ? "Enter new password" : "Enter your password"}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
                      disabled={isLoading}
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleAuth}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="animate-spin" size={20} />}
                {isLoading ? 'Processing...' : 
                 authState === 'login' ? 'Sign In' : 
                 authState === 'signup' ? 'Create Account' :
                 authState === 'forgot_password' ? 'Send Reset Code' : 'Reset Password'}
              </button>

              {authState !== 'confirm_reset' && (
                <button
                  onClick={() => {
                    if (authState === 'forgot_password') {
                      setAuthState('login');
                    } else {
                      setAuthState(authState === 'login' ? 'signup' : 'login');
                    }
                  }}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  {authState === 'login' ? "Don't have an account? Sign up" : 
                   authState === 'signup' ? "Already have an account? Sign in" : "Back to Login"}
                </button>
              )}

              {authState === 'confirm_reset' && (
                <button
                  onClick={() => setAuthState('forgot_password')}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* Additional Options */}
            {authState === 'login' && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setAuthState('forgot_password')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnBoardingPage;