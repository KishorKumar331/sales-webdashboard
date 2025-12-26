import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PaymentPage = () => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      const savedData = await AsyncStorage.getItem('createAccountFormData');
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
      key: 'rzp_test_RNiBf9dqVTjgJt',
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

    RazorpayCheckout.open(options)
      .then(async (data) => {
        console.log('Payment Success:', data);
        await handlePaymentSuccess(data);
      })
      .catch((error) => {
        console.log('Payment Error:', error);

        if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
          Alert.alert(
            'Payment Cancelled',
            'You cancelled the payment. Your account data has not been updated. Please try again to complete your setup.'
          );
        } else {
          Alert.alert(
            'Payment Failed',
            `Error: ${error.code} | ${error.description || 'There was a problem processing your payment. Your account data has not been updated.'}`
          );
        }

        // DO NOT update user data on payment failure or cancellation
        // User data remains unchanged, they can retry payment later
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateAccountPaymentStatus = async (isPaid = false) => {
    try {
      const accountData = await AsyncStorage.getItem('createAccountFormData');
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
      await AsyncStorage.setItem('paymentDetails', JSON.stringify({
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        signature: paymentData.razorpay_signature,
        timestamp: new Date().toISOString(),
      }));

      // Update account with paid status
      const updatedProfile = await updateAccountPaymentStatus(true);

      // Update userProfile with paid status
      if (updatedProfile) {
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }

      // Clear form data
      await AsyncStorage.removeItem('createAccountFormData');
      await AsyncStorage.removeItem('createAccountCurrentStep');

      Alert.alert(
        'Payment Successful! 🎉',
        'Your account has been set up successfully. Welcome to Journey Routers!',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error handling payment success:', error);
      Alert.alert('Error', 'Payment was successful but there was an error setting up your account. Please contact support.');
    }
  };

  const handleSkipPayment = async () => {
    Alert.alert(
      'Skip Payment?',
      'You can skip the payment for now and complete it later from your profile settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip for Now',
          onPress: async () => {
            try {
              // Update account with unpaid status
              const updatedProfile = await updateAccountPaymentStatus(false);

              // Update userProfile with unpaid status
              if (updatedProfile) {
                await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
              }

              // Clear form data
              await AsyncStorage.removeItem('createAccountFormData');
              await AsyncStorage.removeItem('createAccountCurrentStep');

              router.replace('/(tabs)');
            } catch (error) {
              console.error('Error skipping payment:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-semibold text-gray-900">Complete Setup</Text>
          <View className="w-6" />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-8">
        {/* Success Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">Almost Done!</Text>
          <Text className="text-gray-600 text-center mt-2">
            Complete your account setup with our premium plan
          </Text>
        </View>

        {/* Pricing Card */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <LinearGradient
            colors={['#7c3aed', '#5b21b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-xl p-6 mb-4"
          >
            <View className="items-center">
              <Text className="text-white text-lg font-medium">Premium Plan</Text>
              <View className="flex-row items-baseline mt-2">
                <Text className="text-white text-4xl font-bold">₹999</Text>
                <Text className="text-white/80 text-lg ml-1">/month</Text>
              </View>
            </View>
          </LinearGradient>

          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-gray-700 ml-3">Unlimited quotations</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-gray-700 ml-3">Advanced analytics</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-gray-700 ml-3">Priority support</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-gray-700 ml-3">Custom branding</Text>
            </View>
          </View>
        </View>

        {/* User Details */}
        {userDetails && (
          <View className="bg-white rounded-xl p-4 mb-6">
            <Text className="text-gray-700 font-medium mb-2">Account Details:</Text>
            <Text className="text-gray-600">
              {userDetails.FullName}
            </Text>
            <Text className="text-gray-600">{userDetails.Email}</Text>
            <Text className="text-gray-600">{userDetails.Phone}</Text>
            <Text className="text-gray-600">{userDetails.CompanyName}</Text>
          </View>
        )}
      </View>

      {/* Payment Buttons */}
      <View className="px-6 py-4 space-y-3">
        <Pressable
          onPress={handlePayment}
          disabled={isLoading}
          className="overflow-hidden rounded-full"
        >
          <LinearGradient
            colors={["#7c3aed", "#5b21b6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, borderRadius: 9999 }}
          >
            <View className="flex-row items-center justify-center">
              {isLoading && <ActivityIndicator size="small" color="white" className="mr-2" />}
              <Text className="text-center text-white font-semibold text-base">
                {isLoading ? 'Processing...' : 'Pay ₹999 & Complete Setup'}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={handleSkipPayment}
          className="bg-gray-200 rounded-full py-4"
        >
          <Text className="text-center text-gray-700 font-semibold">Skip for Now</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default PaymentPage;

