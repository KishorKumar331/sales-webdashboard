import React, { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { 
  Building2, 
  CreditCard, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  Sparkles,
  Hourglass
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { uploadCompanyLogo, uploadPaymentQR } from "../../../../utils/fileToDataUrl";
import { BasicDetailForm } from "./BasicDetailForm";
import { OrganizationDetailForm } from "./OrganizationDetailForm";
import { PaymentDetailForm } from "./PaymentDetailForm";
import { Card, ProgressBar, StepTitle } from "./FormLayoutComponents"; // We'll create these

const LS_FORM_KEY = "createAccountFormData";

export const CompanySetupForm = ({ initialData = {}, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const methods = useForm({
    defaultValues: {
      company: initialData.company || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      fullname: initialData.fullname || "",
      companyname: initialData.companyname || "",
      brandname: initialData.brandname || "",
      tagline: initialData.tagline || "",
      logourl: initialData.logourl || "",
      website: initialData.website || "",
      companygstnumber: initialData.companygstnumber || "",
      pan: initialData.pan || "",
      registrationnumber: initialData.registrationnumber || "",
      taxregion: initialData.taxregion || "",
      supportemail: initialData.supportemail || "",
      billingemail: initialData.billingemail || "",
      officephone: initialData.officephone || "",
      address: initialData.address || "",
      bankname: initialData.bankname || "",
      accountnumber: initialData.accountnumber || "",
      ifsccode: initialData.ifsccode || "",
      branchname: initialData.branchname || "",
      currency: initialData.currency || "INR",
      upiid: initialData.upiid || "",
      qrurl: initialData.qrurl || "",
      timezone: "Asia/Kolkata",
      language: "en",
      plan: "premium"
    },
    mode: "onChange"
  });

  const { getValues, setValue, trigger, handleSubmit, watch } = methods;

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(LS_FORM_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const companyName = getValues("companyname") || 'unknown-company';
      const logoUrl = await uploadCompanyLogo(file, companyName);
      setValue("logourl", logoUrl.cdn_url, { shouldValidate: true });
    } catch (err) {
      console.error("Logo upload error:", err);
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
       const companyName = getValues("companyname") || 'unknown-company';
       const qrUrl = await uploadPaymentQR(file, companyName);
       setValue("qrurl", qrUrl.cdn_url, { shouldValidate: true });
    } catch (err) {
       console.error("QR upload error:", err);
    }
  };

  const validateStep = async (step) => {
    let fieldsToValidate = [];
    switch (step) {
      case 1: fieldsToValidate = ['fullname', 'email', 'phone']; break;
      case 2: fieldsToValidate = ['company', 'companyname', 'address']; break;
      case 3: fieldsToValidate = ['bankname', 'branchname', 'accountnumber', 'ifsccode']; break;
      default: return false;
    }
    return await trigger(fieldsToValidate);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        localStorage.removeItem(LS_FORM_KEY);
        if (onComplete) {
          onComplete(data);
        } else {
          navigate("/(auth)/PaymentGateway/payment");
        }
      } else {
        const res = await response.json();
        alert(res?.message || "Failed to save details");
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stepMeta = {
    1: { title: "Personal Info", subtitle: "Tell us about yourself", icon: User },
    2: { title: "Organization Info", subtitle: "Your company details", icon: Building2 },
    3: { title: "Payment Info", subtitle: "Banking & payment setup", icon: CreditCard },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Hourglass className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Saving your business profile...</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto">
        <ProgressBar currentStep={currentStep} totalSteps={3} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <StepTitle 
            title={stepMeta[currentStep].title} 
            subtitle={stepMeta[currentStep].subtitle} 
            Icon={stepMeta[currentStep].icon} 
          />

          <div className="pb-6">
            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}><BasicDetailForm /></div>
            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}><OrganizationDetailForm handleLogoUpload={handleLogoUpload} /></div>
            <div style={{ display: currentStep === 3 ? 'block' : 'none' }}><PaymentDetailForm handleQRUpload={handleQRUpload} /></div>
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-6 flex gap-4">
             {currentStep > 1 && (
               <button type="button" onClick={() => setCurrentStep(s => s - 1)} className="flex-1 bg-gray-100 py-4 font-semibold rounded-xl">Previous</button>
             )}
             {currentStep === 3 ? (
               <button type="submit" className="flex-1 bg-purple-600 text-white py-4 font-semibold rounded-xl">Complete Setup</button>
             ) : (
               <button type="button" onClick={nextStep} className="flex-1 bg-purple-600 text-white py-4 font-semibold rounded-xl">Continue</button>
             )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
};
