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
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

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
  const { login } = useAuth();
  const { resetPassword, confirmResetPassword } = useAuth();

  // No longer need auto-switch here, App.jsx handles it via ProtectedRoute

  // PROFILE_API constant
  const PROFILE_API = 'https://zlp6ym88u0.execute-api.ap-south-1.amazonaws.com/prod/Auth?';


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
    const container = event.currentTarget || event.target;
    const width = container.clientWidth;
    if (width > 0) {
      const scrollPosition = container.scrollLeft;
      const index = Math.round(scrollPosition / width);
      if (index >= 0 && index < carouselData.length && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
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
      const { signIn, signOut } = await import('aws-amplify/auth');

      let signInResult;
      try {
        signInResult = await signIn({
          username: loginInput,
          password: password,
        });
      } catch (signInError) {
        if (signInError.name === 'UserAlreadyAuthenticatedException') {
          await signOut();
          signInResult = await signIn({
            username: loginInput,
            password: password,
          });
        } else {
          throw signInError;
        }
      }

      if (signInResult.isSignedIn) {
        const result = await login({ email: loginInput });
        debugger;
        if (result.success) {
          console.log(result.hasProfile)
          debugger;
          if (!result.hasProfile) {
            showToast('Almost there! Please complete your business profile.', 'info');
          } else {
            showToast('Login successful!');
            window.location.href = "/";
          }
          setShowLoginModal(false);
          // App.jsx ProtectedRoute will handle the redirect to /create-profile if hasProfile is false
        }
      } else {
        showToast(`Login step required: ${signInResult.nextStep.signInStep}`, 'info');
      }
    } catch (error) {
      showToast(error.message || 'Login failed. Please check your credentials.', 'error');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToSlide = (index) => {
    if (scrollViewRef.current) {
      const width = scrollViewRef.current.clientWidth;
      scrollViewRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (scrollViewRef.current) {
        const width = scrollViewRef.current.clientWidth;
        scrollViewRef.current.scrollTo({
          left: width * currentIndex,
          behavior: 'auto'
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

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

  if (authState === 'confirm_reset') {
    // Keep confirm_reset logic if needed, but usually it's also a part of login/setup
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-b-2xl sm:rounded-b-3xl px-3 sm:px-6 py-3 sm:py-5 shadow-xl shrink-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
            </div>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate">
              Quick Quotes
            </h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setShowLoginModal(true);
                setAuthState('login');
              }}
              className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/20 text-white font-medium hover:bg-white/30 transition-all duration-200 backdrop-blur-sm flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Login</span>
            </button>
            <button
              onClick={() => {
                navigate('/signup');
              }}
              className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-white text-purple-700 font-medium hover:bg-gray-100 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 shadow-md text-xs sm:text-sm active:scale-95 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Carousel */}
      <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
        <div
          ref={scrollViewRef}
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
          onScroll={handleScroll}
        >
          {carouselData.map((item, index) => (
            <div
              key={item.id}
              className="w-full flex-shrink-0 snap-start px-4 sm:px-6 md:px-8 py-4 sm:py-8 flex items-center justify-center overflow-y-auto"
              style={{ minWidth: '100%', width: '100%' }}
            >
              <div className="max-w-3xl w-full mx-auto text-center flex flex-col items-center justify-center pb-20 sm:pb-24">
                {/* Icon with animation */}
                <div className={`mb-4 sm:mb-6 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${item.bgColor} shadow-xl transform transition-all duration-500 ${index === currentIndex ? 'scale-105 sm:scale-110 rotate-3' : 'scale-100 rotate-0'
                  }`}>
                  <div className="text-white [&>svg]:w-8 [&>svg]:h-8 sm:[&>svg]:w-10 sm:[&>svg]:h-10 md:[&>svg]:w-12 md:[&>svg]:h-12 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-1.5 sm:mb-3 leading-tight tracking-tight px-2">
                  {item.title}
                </h2>
                <p className="text-sm sm:text-lg md:text-xl text-purple-600 font-semibold mb-2 sm:mb-3 px-2">
                  {item.subtitle}
                </p>
                <p className="text-xs sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 max-w-xl mx-auto px-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3 mb-5 sm:mb-8 px-2 max-w-lg mx-auto">
                  {item.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 bg-white rounded-full shadow-sm sm:shadow-md border border-gray-100 text-xs sm:text-sm text-gray-700 font-medium"
                    >
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center w-full max-w-xs sm:max-w-md mx-auto px-2">
                  <button
                    onClick={() => {
                      navigate('/signup');
                    }}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold text-xs sm:text-base rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span>Get Started Free</span>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3.5 bg-white text-purple-700 font-semibold text-xs sm:text-base rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-purple-200 active:scale-95 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Learn More</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation */}
        <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 flex items-center justify-between px-3 sm:px-8 max-w-4xl mx-auto pointer-events-none">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`pointer-events-auto p-2 sm:p-3 rounded-xl transition-all duration-200 ${currentIndex === 0
              ? 'bg-gray-200/80 text-gray-400 cursor-not-allowed'
              : 'bg-white text-purple-600 hover:bg-purple-50 shadow-md hover:shadow-xl active:scale-90 cursor-pointer'
              }`}
            aria-label="Previous slide"
          >
            <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 rotate-180" />
          </button>

          {/* Enhanced Dots */}
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 bg-white/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md border border-gray-100">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 cursor-pointer ${index === currentIndex
                  ? 'w-6 sm:w-10 h-2 sm:h-2.5 bg-purple-600 rounded-full shadow-sm'
                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-gray-300 rounded-full hover:bg-gray-400'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentIndex === carouselData.length - 1}
            className={`pointer-events-auto p-2 sm:p-3 rounded-xl transition-all duration-200 ${currentIndex === carouselData.length - 1
              ? 'bg-gray-200/80 text-gray-400 cursor-not-allowed'
              : 'bg-white text-purple-600 hover:bg-purple-50 shadow-md hover:shadow-xl active:scale-90 cursor-pointer'
              }`}
            aria-label="Next slide"
          >
            <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Enhanced Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md shadow-2xl my-auto max-h-[92vh] overflow-y-auto transform transition-all duration-300">
            <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {authState === 'login' ? 'Welcome Back' :
                    authState === 'forgot_password' ? 'Reset Password' : 'Confirm Reset'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {authState === 'login' ? 'Sign in to continue to Quick Quotes' :
                    authState === 'forgot_password' ? 'Enter your email to receive a code' : 'Enter the code sent to your email'}
                </p>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0 text-gray-500 hover:text-gray-700 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1.5 text-xs sm:text-sm">Email or Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Enter your email or phone"
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white text-base transition-colors"
                    disabled={isLoading || authState === 'confirm_reset'}
                  />
                  <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {isValidEmail(loginInput) ? (
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    ) : (
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {authState === 'confirm_reset' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5 text-xs sm:text-sm">Confirmation Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      placeholder="Enter verification code"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white text-base transition-colors"
                      disabled={isLoading}
                    />
                    <Sparkles className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {(authState === 'login' || authState === 'confirm_reset') && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5 text-xs sm:text-sm">
                    {authState === 'confirm_reset' ? 'New Password' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authState === 'confirm_reset' ? "Enter new password" : "Enter your password"}
                      className="w-full pl-11 pr-11 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white text-base transition-colors"
                      disabled={isLoading}
                    />
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3">
              <button
                onClick={handleAuth}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base active:scale-98 shadow-md cursor-pointer"
              >
                {isLoading && <Loader2 className="animate-spin" size={18} />}
                {isLoading ? 'Processing...' :
                  authState === 'login' ? 'Sign In' :
                    authState === 'forgot_password' ? 'Send Reset Code' : 'Reset Password'}
              </button>

              {authState !== 'confirm_reset' && (
                <button
                  onClick={() => {
                    if (authState === 'forgot_password') {
                      setAuthState('login');
                    } else {
                      navigate('/signup');
                    }
                  }}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl hover:bg-gray-200 transition-colors text-sm sm:text-base active:scale-98 cursor-pointer"
                  disabled={isLoading}
                >
                  {authState === 'login' ? "Don't have an account? Sign up" : "Back to Login"}
                </button>
              )}

              {authState === 'confirm_reset' && (
                <button
                  onClick={() => setAuthState('forgot_password')}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl hover:bg-gray-200 transition-colors text-sm sm:text-base active:scale-98 cursor-pointer"
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
                  className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium hover:underline p-1 cursor-pointer"
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