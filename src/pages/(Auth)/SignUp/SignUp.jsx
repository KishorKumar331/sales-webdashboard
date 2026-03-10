import React, { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Hourglass,
  Check,
  Sparkles,
  Zap,
  ArrowRight,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { uploadCompanyLogo, uploadPaymentQR } from "../../../utils/fileToDataUrl";
import { BasicDetailForm } from "./components/BasicDetailForm";
import { OrganizationDetailForm } from "./components/OrganizationDetailForm";
import { PaymentDetailForm } from "./components/PaymentDetailForm";

export const Field = ({ label, required, children, icon, error }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-gray-700 font-medium">
      {icon && <span className="w-4 h-4 text-purple-600">{icon}</span>}
      {label} {required ? <span className="text-red-500">*</span> : null}
    </div>
    {children}
    {error && <span className="text-xs text-red-500 mt-1">{error.message}</span>}
  </div>
);

export const Card = ({ icon, heading, subheading, children, stepNumber, isActive }) => (
  <div className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-500 ${isActive ? 'border-purple-500 shadow-purple-200' : 'border-gray-100'
    }`}>
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-linear-to-br from-purple-600 to-purple-800 shadow-lg scale-110' : 'bg-purple-100'
          }`}>
          <span className={isActive ? 'text-white' : 'text-purple-600'}>
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
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
export const UploadBox = ({ value, onChange, acceptHint, previewSize = 64, emptyIcon, emptyText }) => (
  <label className="cursor-pointer block group">
    <div className="relative overflow-hidden">
      <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-300 ${value
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

export const Input = React.forwardRef(({ icon, hasError, ...props }, ref) => (
  <div className="relative">
    <input
      {...props}
      ref={ref}
      className={`w-full px-4 py-3 ${icon ? 'pl-12' : ''} bg-gray-50 border-2 ${hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'} rounded-xl text-gray-900 placeholder-gray-500 outline-none transition-all duration-200 focus:bg-white focus:shadow-lg ${props.className || ""}`}
    />
    {icon && (
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </span>
    )}
  </div>
));

export const TextArea = React.forwardRef(({ hasError, ...props }, ref) => (
  <div className="relative">
    <textarea
      {...props}
      ref={ref}
      className={`w-full px-4 py-3 bg-gray-50 border-2 ${hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'} rounded-xl text-gray-900 placeholder-gray-500 outline-none transition-all duration-200 focus:bg-white focus:shadow-lg resize-none ${props.className || ""}`}
    />
  </div>
));


const LS_FORM_KEY = "createAccountFormData";
const LS_STEP_KEY = "createAccountCurrentStep";

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const methods = useForm({
    defaultValues: {
      companyid: "",
      email: "",
      phone: "",
      fullname: "",
      companyname: "",
      brandname: "",
      tagline: "",
      logourl: null,
      website: "",
      companygstnumber: "",
      pan: "",
      registrationnumber: "",
      taxregion: "",
      supportemail: "",
      billingemail: "",
      officephone: "",
      address: "",
      bankname: "",
      accountnumber: "",
      ifsccode: "",
      branchname: "",
      currency: "INR",
      upiid: "",
      qrurl: null,
      timezone: "Asia/Kolkata",
      language: "en",
      plan: "premium"
    },
    mode: "onChange"
  });

  const { getValues, setValue, trigger, handleSubmit, watch } = methods;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_FORM_KEY);
      const savedStep = localStorage.getItem(LS_STEP_KEY);

      if (saved) {
        methods.reset(JSON.parse(saved));
      }
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10) || 1);
      }
    } catch (e) {
      console.error("Error loading saved data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [methods]);

  useEffect(() => {
    if (isLoading) return;
    const subscription = watch((value) => {
      localStorage.setItem(LS_FORM_KEY, JSON.stringify(value));
    });
    localStorage.setItem(LS_STEP_KEY, String(currentStep));
    return () => subscription.unsubscribe();
  }, [watch, currentStep, isLoading]);

  const showToast = (message) => {
    alert(message);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    try {
      const companyName = getValues("companyname") || 'unknown-company';
      console.log('Uploading logo for company:', companyName);

      const logoUrl = await uploadCompanyLogo(file, companyName);
      console.log('Logo uploaded successfully, URL:', logoUrl);

      setValue("logourl", logoUrl.cdn_url, { shouldValidate: true, shouldDirty: true });
      showToast("Logo uploaded successfully!");
    } catch (err) {
      console.error("Logo upload error:", err);
      alert("Failed to upload logo. Please try again.");
    } finally {
      e.target.value = "";
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2MB.");
      return;
    }

    try {
      const companyName = getValues("companyname") || 'unknown-company';
      console.log('Uploading QR code for company:', companyName);

      const qrUrl = await uploadPaymentQR(file, companyName);
      console.log('QR code uploaded successfully, URL:', qrUrl);

      setValue("qrurl", qrUrl.cdn_url, { shouldValidate: true, shouldDirty: true });
      showToast("QR code uploaded successfully!");
    } catch (err) {
      console.error("QR upload error:", err);
      alert("Failed to upload QR code. Please try again.");
    } finally {
      e.target.value = "";
    }
  };

  const validateStep = async (step) => {
    let fieldsToValidate = [];
    switch (step) {
      case 1:
        fieldsToValidate = ['fullname', 'email', 'phone'];
        break;
      case 2:
        fieldsToValidate = ['companyid', 'companyname', 'address'];
        break;
      case 3:
        fieldsToValidate = ['bankname', 'branchname', 'accountnumber', 'ifsccode'];
        break;
      default:
        return false;
    }
    const result = await trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const onSubmit = async (data) => {
    if (currentStep !== 3) return;

    const isValid = await validateStep(3);
    if (!isValid) return;

    try {
      const response = await fetch(
        "https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("userProfile", JSON.stringify(data));
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
      <div className="h-full bg-linear-to-r from-purple-600 to-purple-800 rounded-full transition-all duration-500 shadow-lg"
        style={{ width: `${(currentStep / 3) * 100}%` }}
      />
    </div>
  );

  const Header = () => (
    <div className="bg-linear-to-r from-purple-600 via-purple-700 to-indigo-800 px-5 py-6 shadow-xl">
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
        <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg">
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
          type="button"
          onClick={prevStep}
          className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-4 font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
      )}

      {currentStep === 3 ? (
        <button
          type="submit"
          className="flex-1 bg-linear-to-r from-purple-600 to-purple-800 text-white rounded-xl py-4 font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Complete Setup
        </button>
      ) : (
        <button
          type="button"
          onClick={nextStep}
          className="flex-1 bg-linear-to-r from-purple-600 to-purple-800 text-white rounded-xl py-4 font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-lg">
            <Hourglass className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="text-gray-700 font-medium">Loading your progress...</div>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-50">
        <Header />
        <div className="px-6 py-4">
          <ProgressBar />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl">
          <StepTitle />

          <div className="pb-6">
            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              <BasicDetailForm />
            </div>
            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
              <OrganizationDetailForm handleLogoUpload={handleLogoUpload} />
            </div>
            <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
              <PaymentDetailForm handleQRUpload={handleQRUpload} />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
            <Buttons />
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
