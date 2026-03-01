"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Hourglass,
  PersonStanding,
  CloudUpload,
  QrCode,
  Check,
  Sparkles,
  Zap,
  Shield,
  Star,
  ArrowRight,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  CreditCard as CardIcon,
  BanknoteIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Field = ({ label, required, children, icon }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-gray-700 font-medium">
      {icon && <span className="w-4 h-4 text-purple-600">{icon}</span>}
      {label} {required ? <span className="text-red-500">*</span> : null}
    </div>
    {children}
  </div>
);

const Card = ({ icon, heading, subheading, children, stepNumber, isActive }) => (
  <div className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-500 ${
    isActive ? 'border-purple-500 shadow-purple-200' : 'border-gray-100'
  }`}>
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive ? 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg scale-110' : 'bg-purple-100'
        }`}>
          <span className={isActive ? 'text-white' : 'text-purple-600'}>
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              Step {stepNumber}
            </span>
            {isActive && <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />}
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{heading}</div>
          <div className="text-gray-600 text-sm mt-1">{subheading}</div>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  </div>
);

const UploadBox = ({ value, onChange, acceptHint, previewSize = 64, emptyIcon, emptyText, label }) => (
  <label className="cursor-pointer block group">
    <div className="relative overflow-hidden">
      <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-300 ${
        value 
          ? 'border-green-400 bg-green-50' 
          : 'border-gray-300 bg-gray-50 group-hover:border-purple-400 group-hover:bg-purple-50'
      }`}>
        {value ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={value}
                alt="uploaded"
                className="rounded-lg shadow-lg object-cover"
                style={{ width: previewSize, height: previewSize }}
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-green-600 font-semibold mt-2">Uploaded Successfully!</div>
            <div className="text-gray-500 text-sm">Click to change</div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              {emptyIcon}
            </div>
            <div className="text-gray-700 font-medium mt-3">{emptyText}</div>
            <div className="text-gray-500 text-sm text-center">{acceptHint}</div>
          </div>
        )}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  </label>
);

const Input = React.forwardRef((props, ref) => (
  <div className="relative">
    <input
      {...props}
      ref={ref}
      className={`w-full px-4 py-3 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 outline-none transition-all duration-200 focus:border-purple-500 focus:bg-white focus:shadow-lg ${props.className || ""}`}
    />
    {props.icon && (
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        {props.icon}
      </span>
    )}
  </div>
));

const TextArea = React.forwardRef((props, ref) => (
  <div className="relative">
    <textarea
      {...props}
      ref={ref}
      className={`w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 outline-none transition-all duration-200 focus:border-purple-500 focus:bg-white focus:shadow-lg resize-none ${props.className || ""}`}
    />
  </div>
));

const Step1 = ({ formData, updateFormData }) => (
  <>
    <Card
      icon={<User className="w-8 h-8" />}
      heading="Welcome! Let's get started"
      subheading="Tell us about yourself to personalize your experience"
      stepNumber={1}
      isActive={true}
    >
      <Field label="Full Name" required icon={<User className="w-4 h-4" />}>
        <Input
          value={formData.FullName}
          onChange={(e) => updateFormData("FullName", e.target.value)}
          placeholder="Enter your full name"
          icon={<User className="w-5 h-5" />}
        />
      </Field>

      <Field label="Email Address" required icon={<Mail className="w-4 h-4" />}>
        <Input
          value={formData.Email}
          onChange={(e) => updateFormData("Email", e.target.value)}
          placeholder="Enter your email"
          type="email"
          autoCapitalize="none"
          icon={<Mail className="w-5 h-5" />}
        />
      </Field>

      <Field label="Phone Number" required icon={<Phone className="w-4 h-4" />}>
        <Input
          value={formData.Phone}
          onChange={(e) => updateFormData("Phone", e.target.value)}
          placeholder="Enter your phone number"
          icon={<Phone className="w-5 h-5" />}
        />
      </Field>
    </Card>
  </>
);

const Step2 = ({ formData, updateFormData }) => (
  <div className="px-6 space-y-4">
    <Card
      icon={<Building2 className="w-8 h-8" />}
      heading="Organization Details"
      subheading="Help us understand your business better"
      stepNumber={2}
      isActive={true}
    >
      <Field label="Company Name" required icon={<Briefcase className="w-4 h-4" />}>
        <Input
          value={formData.CompanyName}
          onChange={(e) => updateFormData("CompanyName", e.target.value)}
          placeholder="Enter company name"
          icon={<Briefcase className="w-5 h-5" />}
        />
      </Field>

      <Field label="Company Address" required icon={<MapPin className="w-4 h-4" />}>
        <TextArea
          value={formData.CompanyAddress}
          onChange={(e) => updateFormData("CompanyAddress", e.target.value)}
          placeholder="Enter complete company address"
          rows={3}
        />
      </Field>

      <Field label="Company Website" icon={<Globe className="w-4 h-4" />}>
        <Input
          value={formData.CompanyWebsite}
          onChange={(e) => updateFormData("CompanyWebsite", e.target.value)}
          placeholder="https://www.example.com"
          type="url"
          autoCapitalize="none"
          icon={<Globe className="w-5 h-5" />}
        />
      </Field>

      <Field label="Upload Company Logo">
        <UploadBox
          value={formData.CompanyLogoUrl}
          onChange={handleLogoUpload}
          acceptHint="PNG, JPG up to 5MB"
          previewSize={80}
          emptyIcon={<CloudUpload className="w-8 h-8 text-gray-400" />}
          emptyText="Upload your company logo"
          label="Company Logo"
        />
      </Field>

      <Field label="GST Number">
        <Input
          value={formData.CompanyGSTNumber}
          onChange={(e) => updateFormData("CompanyGSTNumber", e.target.value.toUpperCase())}
          placeholder="Enter GST number"
          icon={<CardIcon className="w-5 h-5" />}
        />
      </Field>

      <Field label="Invoice Number Format">
        <Input
          value={formData.InvoiceNumber}
          onChange={(e) => updateFormData("InvoiceNumber", e.target.value)}
          placeholder="e.g., INV-2024-001"
          icon={<BanknoteIcon className="w-5 h-5" />}
        />
      </Field>
    </Card>
  </div>
);

const Step3 = ({ formData, updateFormData }) => (
  <div className="px-6 space-y-4">
    <Card
      icon={<CreditCard className="w-8 h-8" />}
      heading="Payment Setup"
      subheading="Configure your payment methods for seamless transactions"
      stepNumber={3}
      isActive={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Bank Name" required icon={<Building2 className="w-4 h-4" />}>
          <Input
            value={formData.BankName}
            onChange={(e) => updateFormData("BankName", e.target.value)}
            placeholder="Enter bank name"
            icon={<Building2 className="w-5 h-5" />}
          />
        </Field>

        <Field label="Branch Name" required icon={<MapPin className="w-4 h-4" />}>
          <Input
            value={formData.BranchName}
            onChange={(e) => updateFormData("BranchName", e.target.value)}
            placeholder="Enter branch name"
            icon={<MapPin className="w-5 h-5" />}
          />
        </Field>
      </div>

      <Field label="Account Number" required icon={<CreditCard className="w-4 h-4" />}>
        <Input
          value={formData.AccountNumber}
          onChange={(e) => updateFormData("AccountNumber", e.target.value)}
          placeholder="Enter account number"
          inputMode="numeric"
          icon={<CreditCard className="w-5 h-5" />}
        />
      </Field>

      <Field label="IFSC Code" required>
        <Input
          value={formData.IfscCode}
          onChange={(e) => updateFormData("IfscCode", e.target.value.toUpperCase())}
          placeholder="Enter IFSC code"
        />
      </Field>

      <Field label="UPI ID">
        <Input
          value={formData.UpiId}
          onChange={(e) => updateFormData("UpiId", e.target.value)}
          placeholder="yourname@paytm"
          autoCapitalize="none"
        />
      </Field>

      <Field label="Payment QR Code">
        <UploadBox
          value={formData.QrCode}
          onChange={handleQRUpload}
          acceptHint="PNG, JPG up to 2MB"
          previewSize={100}
          emptyIcon={<QrCode className="w-8 h-8 text-gray-400" />}
          emptyText="Upload QR code for payments"
          label="QR Code"
        />
      </Field>
    </Card>
  </div>
);

const LS_FORM_KEY = "createAccountFormData";
const LS_STEP_KEY = "createAccountCurrentStep";

const handleQRUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("Please select an image smaller than 2MB.");
    return;
  }

  try {
    const dataUrl = await fileToDataUrl(file);
    updateFormData("QrCode", dataUrl);
    showToast("QR code uploaded successfully!");
  } catch (err) {
    console.error("QR upload error:", err);
    alert("Failed to upload QR code. Please try again.");
  } finally {
    e.target.value = "";
  }
};

const handleLogoUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("Please select an image smaller than 5MB.");
    return;
  }

  try {
    const dataUrl = await fileToDataUrl(file);
    updateFormData("CompanyLogoUrl", dataUrl);
    showToast("Logo uploaded successfully!");
  } catch (err) {
    console.error("Logo upload error:", err);
    alert("Failed to upload logo. Please try again.");
  } finally {
    e.target.value = "";
  }
};

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    Email: "",
    Phone: "",
    FullName: "",
    Role: "Salesperson",
    CompanyName: "",
    CompanyAddress: "",
    CompanyGSTNumber: "",
    CompanyWebsite: "",
    CompanyLogoUrl: null,
    InvoiceNumber: "",
    BankName: "",
    BranchName: "",
    AccountNumber: "",
    IfscCode: "",
    UpiId: "",
    QrCode: null,
    CompanyId: "",
    Balance: 0,
    Currency: "INR",
    SubscriptionPlanId: "",
    SubscriptionType: "",
    SubscriptionStatus: "InActive",
    Features_MaxQuotesPerMonth: 0,
    Features_QuoteCharge: 0,
    Features_PaymentProofUpload: false,
    Features_InAppNotifications: false,
    Features_WebNotifications: false,
    Features_AnalyticsDashboard: false,
    LoginDevices: {
      Web: { LoggedIn: false, LastLogin: null, DeviceInfo: null },
      Mobile: { LoggedIn: false, LastLogin: null, DeviceInfo: null },
    },
    Preferences: {
      Notifications: { InApp: true, Email: true, SMS: false, WebPush: true },
      Theme: "light",
      Language: "en",
    },
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_FORM_KEY);
      const savedStep = localStorage.getItem(LS_STEP_KEY);

      if (saved) {
        setFormData(JSON.parse(saved));
      }
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10) || 1);
      }
    } catch (e) {
      console.error("Error loading saved data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    localStorage.setItem(LS_FORM_KEY, JSON.stringify(formData));
    localStorage.setItem(LS_STEP_KEY, String(currentStep));
  }, [currentStep, isLoading]);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  const showToast = (message) => {
    alert(message);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return !!(formData.FullName && formData.Email && formData.Phone && formData.Role);
      case 2:
        return !!(formData.CompanyName && formData.CompanyAddress);
      case 3:
        return !!(formData.BankName && formData.AccountNumber);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      alert("Please fill in all required fields before continuing.");
      return;
    }
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const navigate = useNavigate();

  const fillEmptyFields = (data) => {
    const currentDate = new Date().toISOString();
    const companyNamePart = data.CompanyName?.replace(/\s+/g, "").substring(0, 6).toUpperCase() || "COMP";
    const usernamePart = data.Email?.split("@")[0]?.substring(0, 4).toUpperCase() || "USER";
    const mobileLast4 = data.Phone?.slice(-4) || "0000";
    const companyId = `${companyNamePart}${usernamePart}${mobileLast4}`;

    const deviceInfo = {
      platform: "web",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    return {
      ...data,
      CompanyId: data.CompanyId || companyId,
      SubscriptionStart: "",
      SubscriptionEnd: "",
      BankName: data.BankName || "Default Bank",
      LoginDevices: {
        ...data.LoginDevices,
        Web: {
          LoggedIn: true,
          LastLogin: currentDate,
          DeviceInfo: deviceInfo,
        },
      },
    };
  };

  const handleSubmit = async () => {
    try {
      const completeFormData = fillEmptyFields(formData);

      const response = await fetch(
        "https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(completeFormData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("userProfile", JSON.stringify(completeFormData));
        localStorage.removeItem(LS_FORM_KEY);
        localStorage.setItem("accountCreated", "true");

        showToast("Account created successfully!");
        navigate("/(auth)/PaymentGateway/payment");
      } else {
        alert(result?.message || "Failed to create account. Please try again.");
        console.error("API Error:", result);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Network error. Please check your connection and try again.");
    }
  };

  const stepMeta = useMemo(
    () => ({
      1: { title: "Personal Info", subtitle: "Tell us about yourself", icon: User },
      2: { title: "Organization Info", subtitle: "Your company details", icon: Building2 },
      3: { title: "Payment Info", subtitle: "Banking & payment setup", icon: CreditCard },
    }),
    []
  );

  const ProgressBar = () => (
    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-purple-600 to-purple-800 rounded-full transition-all duration-500 shadow-lg"
        style={{ width: `${(currentStep / 3) * 100}%` }}
      />
    </div>
  );

  const Header = () => (
    <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 px-5 py-6 shadow-xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            Create Your Account
          </h1>
          <p className="text-white/80 text-sm mt-1">Join thousands of successful businesses</p>
        </div>

        <div className="w-12" />
      </div>
    </div>
  );

  const StepTitle = () => (
    <div className="px-6 py-6 text-center">
      <div className="inline-flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg">
          {React.createElement(stepMeta[currentStep].icon, { className: "w-6 h-6 text-white" })}
        </div>
        <div className="text-left">
          <div className="text-2xl font-bold text-gray-900">{stepMeta[currentStep].title}</div>
          <div className="text-gray-600">{stepMeta[currentStep].subtitle}</div>
        </div>
      </div>
    </div>
  );

  const Buttons = () => (
    <div className="px-6 py-6 flex gap-4 bg-white border-t border-gray-100">
      {currentStep > 1 && (
        <button
          onClick={prevStep}
          className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-4 font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
      )}

      <button
        onClick={currentStep === 3 ? handleSubmit : nextStep}
        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl py-4 font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {currentStep === 3 ? (
          <>
            <Zap className="w-4 h-4" />
            Complete Setup
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-lg">
            <Hourglass className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="text-gray-700 font-medium">Loading your progress...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header />
      <div className="px-6 py-4">
        <ProgressBar />
      </div>

      <div className="mx-auto max-w-4xl">
        <StepTitle />

        <div className="pb-6">
          {currentStep === 1 && <Step1 formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <Step2 formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <Step3 formData={formData} updateFormData={updateFormData} />}
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
          <Buttons />
        </div>
      </div>
    </div>
  );
}
