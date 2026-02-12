import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

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

    // Console log user details when reaching payment gateway
    console.log(JSON.stringify(userDetails, null, 2));

    const options = {
      description: 'Journey Routers - Account Setup',
      image: 'https://i.imgur.com/3g7nmJC.png',
      currency: 'INR',
      key: 'rzp_test_S5OVwU720vAaEY',
      amount: '100',
      name: 'Journey Routers',
      order_id: '',
      prefill: {
        email: userDetails?.Email || '',
        contact: userDetails?.Phone || '',
        name: userDetails?.FullName || '',
      },
      theme: { color: '#7c3aed' },
    };

    // Load Razorpay script if not already loaded
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
      alert(
        'Payment Cancelled\n\nYou cancelled the payment. Your account data has not been updated. Please try again to complete your setup.'
      );
    } else {
      alert(
        `Payment Failed\n\nError: ${error.code} | ${error.description || 'There was a problem processing your payment. Your account data has not been updated.'}`
      );
    }
  };

  const updateAccountPaymentStatus = async (isPaid = false) => {
    try {
      const accountData = localStorage.getItem('createAccountFormData');
      if (accountData) {
        const parsedData = JSON.parse(accountData);

        console.log(`Updating account payment status: isPaid = ${isPaid}`);

        // Update account with payment status
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

        // Make API call to update account
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
      throw error; // Re-throw to handle in calling function
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

      // Update account with paid status
      const updatedProfile = await updateAccountPaymentStatus(true);

      // Update userProfile with paid status
      if (updatedProfile) {
        await localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }

      // Clear form data
      localStorage.removeItem('createAccountFormData');
      localStorage.removeItem('createAccountCurrentStep');

      alert(
        'Payment Successful! 🎉\n\nYour account has been set up successfully. Welcome to Journey Routers!'
      );
      navigate('/dashboard');
    } catch (error) {
      console.error('Error handling payment success:', error);
      alert('Error\n\nPayment was successful but there was an error setting up your account. Please contact support.');
    }
  };

  const handleSkipPayment = async () => {
    if (confirm('Skip Payment?\n\nYou can skip the payment for now and complete it later from your profile settings.')) {
      try {
        // Update account with unpaid status
        const updatedProfile = await updateAccountPaymentStatus(false);

        // Update userProfile with unpaid status
        if (updatedProfile) {
          await localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }

        // Clear form data
        localStorage.removeItem('createAccountFormData');
        localStorage.removeItem('createAccountCurrentStep');

        navigate('/dashboard');
      } catch (error) {
        console.error('Error skipping payment:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 py-4 pt-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Complete Setup</h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">Almost Done!</h2>
          <p className="text-gray-600 text-center mt-2">
            Complete your account setup with our premium plan
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 mb-4">
            <div className="text-center">
              <h3 className="text-white text-lg font-medium">Premium Plan</h3>
              <div className="flex items-baseline justify-center mt-2">
                <span className="text-white text-4xl font-bold">₹999</span>
                <span className="text-white/80 text-lg ml-1">/month</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 ml-3">Unlimited quotations</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 ml-3">Advanced analytics</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 ml-3">Priority support</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 ml-3">Custom branding</span>
            </div>
          </div>
        </div>

        {/* User Details */}
        {userDetails && (
          <div className="bg-white rounded-xl p-4 mb-6">
            <h4 className="text-gray-700 font-medium mb-2">Account Details:</h4>
            <p className="text-gray-600">{userDetails.FullName}</p>
            <p className="text-gray-600">{userDetails.Email}</p>
            <p className="text-gray-600">{userDetails.Phone}</p>
            <p className="text-gray-600">{userDetails.CompanyName}</p>
          </div>
        )}
      </div>

      {/* Payment Buttons */}
      <div className="px-6 py-4 space-y-3 max-w-md mx-auto">
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center">
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Processing...' : 'Pay ₹999 & Complete Setup'}
          </div>
        </button>

        <button
          onClick={handleSkipPayment}
          className="w-full bg-gray-200 text-gray-700 font-semibold py-4 rounded-full hover:bg-gray-300 transition-colors"
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;

