import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Zap,
  Shield,
  Star,
  Crown,
  CreditCard,
  TrendingUp,
  Users,
  Globe,
  Award,
  Clock,
  HeadphonesIcon,
  ChevronRight,
  Loader2,
  X
} from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      const savedData = localStorage.getItem('createAccountFormData');
      if (savedData) {
        setUserDetails(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const handlePayment = () => {
    setIsLoading(true);

    const options = {
      description: 'Quick Quotes Premium - Complete Setup',
      image: 'https://i.imgur.com/3g7nmJC.png',
      currency: 'INR',
      key: "rzp_live_SshSY8T6PNSHPq",
      amount: '99900', // ₹999 in paise
      name: 'Quick Quotes Premium',
      order_id: '',
      prefill: {
        email: userDetails?.Email || '',
        contact: userDetails?.Phone || '',
        name: userDetails?.FullName || '',
      },
      theme: { color: '#7c3aed' },
      modal: {
        backdropclose: false,
        escape: false,
        handleback: false,
      },
    };

    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        initializeRazorpay(options);
      };
      document.body.appendChild(script);
    } else {
      initializeRazorpay(options);
    }
  };

  const initializeRazorpay = (options) => {
    const razorpay = new window.Razorpay(options);

    razorpay.open();

    razorpay.on('payment.success', async (response) => {
      console.log('Payment Success:', response);
      await handlePaymentSuccess(response);
      setIsLoading(false);
    });

    razorpay.on('payment.error', (response) => {
      console.log('Payment Error:', response);
      handlePaymentError(response);
      setIsLoading(false);
    });
  };

  const handlePaymentError = (error) => {
    if (error.code === 'PAYMENT_CANCELLED') {
      alert('Payment Cancelled\n\nYou cancelled the payment. Your account data has not been updated. Please try again to complete your setup.');
    } else {
      alert(`Payment Failed\n\nError: ${error.code} | ${error.description || 'There was a problem processing your payment. Your account data has not been updated.'}`);
    }
  };

  const updateAccountPaymentStatus = async (isPaid = false) => {
    try {
      const accountData = localStorage.getItem('createAccountFormData');
      if (accountData) {
        const parsedData = JSON.parse(accountData);

        const updatedData = {
          ...parsedData,
          SubscriptionStatus: isPaid ? 'active' : 'inactive',
          SubscriptionPlanId: isPaid ? 'SUB#APP_WEB_001' : '',
          SubscriptionType: isPaid ? 'App+Web' : '',
          SubscriptionStart: isPaid ? new Date().toISOString() : '',
          SubscriptionEnd: isPaid ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : '',
          Balance: isPaid ? 1000 : 0,
          Features_MaxQuotesPerMonth: isPaid ? 200 : 0,
          Features_QuoteCharge: isPaid ? 2 : 0,
          Features_PaymentProofUpload: isPaid,
          Features_InAppNotifications: isPaid,
          Features_WebNotifications: isPaid,
          Features_AnalyticsDashboard: isPaid,
        };

        const response = await fetch('https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/salesapp/Auth', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          console.log(`Account updated successfully with payment status: ${isPaid ? 'PAID' : 'UNPAID'}`);
        } else {
          console.error('Failed to update account via API');
        }

        return updatedData;
      }
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      await localStorage.setItem('paymentDetails', JSON.stringify({
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        signature: paymentData.razorpay_signature,
        timestamp: new Date().toISOString(),
      }));

      const updatedProfile = await updateAccountPaymentStatus(true);

      if (updatedProfile) {
        await localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }

      localStorage.removeItem('createAccountFormData');
      localStorage.removeItem('createAccountCurrentStep');

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error handling payment success:', error);
      alert('Error\n\nPayment was successful but there was an error setting up your account. Please contact support.');
    }
  };

  const handleSkipPayment = async () => {
    if (confirm('Skip Payment?\n\nYou can skip the payment for now and complete it later from your profile settings.')) {
      try {
        const updatedProfile = await updateAccountPaymentStatus(false);

        if (updatedProfile) {
          await localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }

        localStorage.removeItem('createAccountFormData');
        localStorage.removeItem('createAccountCurrentStep');

        navigate('/');
      } catch (error) {
        console.error('Error skipping payment:', error);
      }
    }
  };

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Unlimited Quotations",
      description: "Create as many quotes as you need without limits"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Work together with your team in real-time"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Connect with clients worldwide"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Advanced Security",
      description: "Enterprise-grade data protection"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Custom Branding",
      description: "Personalize your quotes with your brand"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Get help whenever you need it"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white px-5 py-6 shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Complete Your Setup
            </h1>
            <p className="text-gray-600 mt-1">Choose your plan and get started</p>
          </div>

          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Pricing & Features */}
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Almost There!</h2>
              <p className="text-gray-600 text-lg">Complete your account setup with our premium plan</p>
            </div>

            {/* Premium Plan Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-8 h-8 text-yellow-300" />
                  <span className="text-2xl font-bold">Premium Plan</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">₹999</span>
                    <span className="text-xl text-white/80">/month</span>
                  </div>
                  <p className="text-white/70 mt-2">Billed annually at ₹11,988</p>
                </div>

                <div className="space-y-3">
                  {features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{feature.title}</p>
                        <p className="text-white/80 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Everything Included
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      {feature.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{feature.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* vgsahjgdjhas sdhjasj */}
          {/* Right Column - User Details & Payment */}
          <div className="space-y-6">
            {/* User Details Card */}
            {userDetails && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Account Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">
                        {userDetails.FullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{userDetails.FullName}</p>
                      <p className="text-sm text-gray-600">{userDetails.CompanyName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-900">{userDetails.Email}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium text-gray-900">{userDetails.Phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Premium Plan (Monthly)</span>
                  <span className="font-semibold text-gray-900">₹999</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Setup Fee</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-semibold text-gray-900">₹180</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-purple-600">₹1,179</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Secure Payment</p>
                </div>
                <div className="text-center">
                  <HeadphonesIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">24/7 Support</p>
                </div>
                <div className="text-center">
                  <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">30-Day Guarantee</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500">
                Trusted by 10,000+ businesses worldwide
              </p>
            </div>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="mt-8 max-w-md mx-auto">
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-4 px-6 rounded-2xl hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                Pay ₹1,179 & Complete Setup
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          <button
            onClick={handleSkipPayment}
            className="w-full mt-4 bg-white text-gray-700 font-semibold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-colors border-2 border-gray-200"
          >
            Skip for Now
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            You can upgrade to premium anytime from your account settings
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl transform transition-all duration-300 scale-100">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Your account has been set up successfully. Welcome to Quick Quotes Premium!
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;

