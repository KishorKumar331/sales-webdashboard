import  { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import IntegratedQuotationForm from "../components/Forms/IntegratedQuotationForm";
import { clearQuotationDraft } from "../storage/quotationDraft";
import { useUserProfile } from "../hooks/useUserProfile";

const QuotationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get lead data from navigation state
  const leadData = location.state?.leadData || null;
  const followUpData = location.state?.followUpData || null;
  
  console.log('Lead Data:', leadData);
  console.log('Follow-up Data:', followUpData);

  const { user, loading: userLoading } = useUserProfile();

  const [isPrinting, setIsPrinting] = useState(false);


  const [formDataToSubmit, setFormDataToSubmit] = useState(null);

  /* ================= FORM SUBMIT ================= */
  const handleFormSubmit = async (data) => {
    if (isPrinting) return;
    setIsPrinting(true);

    try {


      setFormDataToSubmit({
        ...data,
        CompanyId: user?.CompanyId,
        CompanyEmail: user?.Email,
      });

      const res = await axios.post(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/quotations",
        formDataToSubmit
      );

      console.log("✅ Quotation created:", res.data);

      const updateData = {
        TripId: res?.data?.TripId,
        Quotations: Array.isArray(leadData?.Quotations)
          ? [...leadData.Quotations, res.data.QuoteId]
          : [res.data.QuoteId],
        SalesStatus: "Cold",
        LatestQuotationId: res.data.QuoteId,
        LeadId: leadData?.LeadId || followUpData?.LeadId,
      };

      await axios.put(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote",
        updateData
      );

      await clearQuotationDraft(formDataToSubmit.TripId);

      window.alert("Quotation created and shared successfully!");
      navigate("/");

      console.log("✅ HTML preview ready with user data");
    } catch (error) {
      console.error("❌ Error generating preview:", error);
      window.alert("Failed to generate preview. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };



  /* ================= UI ================= */
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <IntegratedQuotationForm
        onSubmit={handleFormSubmit}
        lead={leadData}
        followUpData={followUpData}
      />
    </div>
  );
};

/* ================= STYLES ================= */



export default QuotationScreen;
