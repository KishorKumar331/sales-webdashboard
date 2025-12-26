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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const Field = ({ label, required, children }) => (
  <div>
    <div className="text-gray-700 font-medium mb-2">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </div>
    {children}
  </div>
);

const Card = ({ icon, heading, subheading, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex flex-col items-center mb-6">
      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-xl font-semibold text-gray-900">{heading}</div>
      <div className="text-gray-600 text-center mt-1">{subheading}</div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">{children}</div>
  </div>
);
const UploadBox = ({ value, onChange, acceptHint, previewSize = 64, emptyIcon, emptyText }) => (
  <label className="cursor-pointer block">
    <div className="bg-gray-50 rounded-xl px-4 py-6 border-2 border-dashed border-gray-300 flex flex-col items-center">
      {value ? (
        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="uploaded"
            className="rounded-lg mb-2 object-cover"
            style={{ width: previewSize, height: previewSize }}
          />
          <div className="text-green-600 font-medium">Uploaded!</div>
          <div className="text-gray-400 text-sm">Click to change</div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {emptyIcon}
          <div className="text-gray-600 mt-2">{emptyText}</div>
          <div className="text-gray-400 text-sm">{acceptHint}</div>
        </div>
      )}

      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  </label>
);
  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB
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

  // 5MB
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

const Step1 = ({ formData, updateFormData }) => (
  <>
    <Card
      icon={<PersonStanding className="w-8 h-8 text-purple-600" />}
      heading="Welcome!"
      subheading="Let's get to know you better"
    >

      <Field label="Full Name" required>
        <Input
          value={formData.FullName}
          onChange={(e) => updateFormData("FullName", e.target.value)}
          placeholder="Enter your full name"
        />

      </Field>

      <Field label="Email Address" required>
        <Input
          value={formData.Email}
          onChange={(e) => updateFormData("Email", e.target.value)}
          placeholder="Enter your email"
          type="email"
          autoCapitalize="none"
        />
      </Field>
      <Field label="Phone Number" required>
        <Input
          value={formData.Phone}
          onChange={(e) => updateFormData("Phone", e.target.value)}
          placeholder="Enter your phone"
        />
      </Field>
    </Card>
  </>
);
const Step2 = ({ formData, updateFormData }) => (
  <div className="px-6 space-y-4">
    <Card
      icon={<Building2 className="w-8 h-8 text-purple-600" />}
      heading="Organization Details"
      subheading="Tell us about your business"
    >
      <Field label="Company Name" required>
        <Input
          value={formData.CompanyName}
          onChange={(e) => updateFormData("CompanyName", e.target.value)}
          placeholder="Enter company name"
        />
      </Field>

      <Field label="Company Address" required>
        <TextArea
          value={formData.CompanyAddress}
          onChange={(e) => updateFormData("CompanyAddress", e.target.value)}
          placeholder="Enter company address"
          rows={3}
        />
      </Field>

      <Field label="Company Website">
        <Input
          value={formData.CompanyWebsite}
          onChange={(e) => updateFormData("CompanyWebsite", e.target.value)}
          placeholder="https://www.example.com"
          type="url"
          autoCapitalize="none"
        />
      </Field>

      <Field label="Upload Logo">
        <UploadBox
          value={formData.CompanyLogoUrl}
          onChange={handleLogoUpload}
          acceptHint="PNG, JPG up to 5MB"
          previewSize={64}
          emptyIcon={<CloudUpload className="w-8 h-8 text-gray-400" />}
          emptyText="Click to upload company logo"
        />
      </Field>

      <Field label="GST Number">
        <Input
          value={formData.CompanyGSTNumber}
          onChange={(e) => updateFormData("CompanyGSTNumber", e.target.value.toUpperCase())}
          placeholder="Enter GST number"
        />
      </Field>

      <Field label="Invoice Number Format">
        <Input
          value={formData.InvoiceNumber}
          onChange={(e) => updateFormData("InvoiceNumber", e.target.value)}
          placeholder="e.g., INV-2024-001"
        />
      </Field>
    </Card>
  </div>
);

const Step3 = ({ formData, updateFormData }) => (
  <div className="px-6 space-y-4">
    <Card
      icon={<CreditCard className="w-8 h-8 text-purple-600" />}
      heading="Payment Setup"
      subheading="Configure your payment methods"
    >
      <Field label="Bank Name" required>
        <Input
          value={formData.BankName}
          onChange={(e) => updateFormData("BankName", e.target.value)}
          placeholder="Enter bank name"
        />
      </Field>

      <Field label="Branch Name" required>
        <Input
          value={formData.BranchName}
          onChange={(e) => updateFormData("BranchName", e.target.value)}
          placeholder="Enter branch name"
        />
      </Field>

      <Field label="Account Number" required>
        <Input
          value={formData.AccountNumber}
          onChange={(e) => updateFormData("AccountNumber", e.target.value)}
          placeholder="Enter account number"
          inputMode="numeric"
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

      <Field label="QR Code Scanner">
        <UploadBox
          value={formData.QrCode}
          onChange={handleQRUpload}
          acceptHint="PNG, JPG up to 2MB"
          previewSize={80}
          emptyIcon={<QrCode className="w-8 h-8 text-gray-400" />}
          emptyText="Upload QR code for payments"
        />
      </Field>
    </Card>
  </div>
);

const LS_FORM_KEY = "createAccountFormData";
const LS_STEP_KEY = "createAccountCurrentStep";
const Input = React.forwardRef((props, ref) => (
  <input
    {...props}
    ref={ref}
    className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-900 w-full outline-none focus:ring-2 focus:ring-purple-200 ${props.className || ""
      }`}
  />
));

const TextArea = React.forwardRef((props, ref) => (
  <textarea
    {...props}
    ref={ref}
    className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-900 w-full outline-none focus:ring-2 focus:ring-purple-200 ${props.className || ""
      }`}
  />
));



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

  // Load saved progress
  // Load saved data on mount
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

  // save ONLY when step changes
  useEffect(() => {
    if (isLoading) return;

    localStorage.setItem(LS_FORM_KEY, JSON.stringify(formData));
    localStorage.setItem(LS_STEP_KEY, String(currentStep));
  }, [currentStep, isLoading]);


  const updateFormData = useCallback((field, value) => {
    setFormData(prev => {
      // Only update if the value has actually changed
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  const showToast = (message) => {
    // Simple web toast
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

  // Convert File -> base64 data URL
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });


  const navigate = useNavigate()


  const fillEmptyFields = (data) => {
    const currentDate = new Date().toISOString();

    const companyNamePart =
      data.CompanyName?.replace(/\s+/g, "").substring(0, 6).toUpperCase() || "COMP";
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
        "https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/salesapp/Auth",
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
      1: { title: "Personal Info", subtitle: "Tell us about yourself" },
      2: { title: "Organization Info", subtitle: "Your company details" },
      3: { title: "Payment Info", subtitle: "Banking & payment setup" },
    }),
    []
  );

  const ProgressBar = () => (
    <div className="bg-purple-100 h-2">
      <div
        className="bg-purple-500 h-full transition-all duration-300"
        style={{ width: `${(currentStep / 3) * 100}%` }}
      />
    </div>
  );

  const Header = () => (
    <div className="bg-white px-5 py-4 sticky top-0 z-10 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.replace("/(auth)");
          }}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="text-xl font-semibold text-gray-900">Create Account</div>
        <div className="w-6" />
      </div>
    </div>
  );

  const StepTitle = () => (
    <div className="px-6 py-4">
      <div className="text-2xl font-bold text-gray-900">{stepMeta[currentStep].title}</div>
      <div className="text-gray-600 mt-1">{stepMeta[currentStep].subtitle}</div>
    </div>
  );

  const Card = ({ icon, heading, subheading, children }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col items-start mb-6">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <div className="text-xl font-semibold text-gray-900">{heading}</div>
        <div className="text-gray-600 text-center mt-1">{subheading}</div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );





  // Add refs for inputs to maintain focus






  const Buttons = () => (
    <div className="px-6 py-4 flex gap-4">
      {currentStep > 1 && (
        <button
          onClick={prevStep}
          className="flex-1 bg-gray-200 rounded-full py-4 text-gray-700 font-semibold hover:bg-gray-300 transition"
        >
          Previous
        </button>
      )}

      <button
        onClick={currentStep === 3 ? handleSubmit : nextStep}
        className="flex-1 rounded-full py-4 text-white font-semibold text-base transition"
        style={{
          backgroundImage: "linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%)",
        }}
      >
        {currentStep === 3 ? "Complete Setup" : "Continue"}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Hourglass className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-gray-600">Loading your progress...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProgressBar />

      <div className="mx-auto">
        <StepTitle />

        <div className="pb-6">
          {currentStep === 1 && <Step1 formData={formData}
            updateFormData={updateFormData} />}
          {currentStep === 2 && <Step2 formData={formData}
            updateFormData={updateFormData} />}
          {currentStep === 3 && <Step3 formData={formData}
            updateFormData={updateFormData} />}
        </div>

        <div className="sticky bottom-0 bg-gray-50/80 backdrop-blur border-t border-gray-100">
          <Buttons />
        </div>
      </div>
    </div>
  );
}
