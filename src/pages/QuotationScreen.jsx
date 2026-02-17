import  { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import IntegratedQuotationForm from "../components/Forms/IntegratedQuotationForm";
import { clearQuotationDraft } from "../storage/quotationDraft";
import { useUserProfile } from "../hooks/useUserProfile";
import PdfPreviewModal from "../components/modals/PdfPreviewModal";

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
  const [pdfUri, setPdfUri] = useState(null);
  const [pdfHtml, setPdfHtml] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formDataToSubmit, setFormDataToSubmit] = useState(null);

  // Smooth scroll to top on component mount
  useEffect(() => {
    // Ensure scroll happens after component is fully rendered
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 100);

    // Also handle immediate scroll for refresh scenarios
    if (window.scrollY > 0) {
      window.scrollTo(0, 0);
    }

    return () => clearTimeout(timer);
  }, []);

  /* ================= FORM SUBMIT ================= */
  const handleFormSubmit = async (data) => {
    if (isPrinting) return;
    setIsPrinting(true);

    try {
      const dataWithUser = {
        ...data,
        user,
      };

      console.log("Data with user:", dataWithUser);
      // Call the new API endpoint to get HTML
      const response = await axios.post(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html",
        {
          type: "quotation",
          renderOnly: true,
          data: dataWithUser,
          templateName: "ip_pdf.hbs",
        }
      );

      if (response.data) {
        console.log("HTML Content received from API");
        setPdfHtml(response.data);
        setPdfUri(null);
        setFormDataToSubmit({
          ...data,
          CompanyId: user?.CompanyId,
          CompanyEmail: user?.Email,
        });
        setShowPdfModal(true);
        setRefreshKey((prev) => prev + 1);
        console.log("✅ HTML set for preview");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("❌ Error generating preview:", error);
      Alert.alert("Error", "Failed to generate preview. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };
  const handlePreviewClose = () => {
    setShowPdfModal(false);
    // Just close the modal, don't submit
  };

  const handleShare = async () => {
    // This runs when user clicks download/share button
    if (!formDataToSubmit) {
      Alert.alert("Error", "No quotation data to submit");
      return;
    }

    try {
      console.log("📤 Submitting quotation to API...");

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

      Alert.alert("Success", "Quotation created and shared successfully!", [
        {
          text: "OK",
          onPress: () => {
            setShowPdfModal(false);
            router.replace("/(tabs)");
          },
        },
      ]);
    } catch (error) {
      console.error("❌ Error submitting:", error);
      Alert.alert(
        "Error",
        "Failed to submit quotation: " + (error?.message || error)
      );
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
        <PdfPreviewModal
        key={refreshKey}
        visible={showPdfModal}
        pdfUri={pdfUri}
        pdfHtml={pdfHtml}
        onClose={handlePreviewClose}
        onShare={handleShare}
      />
    </div>
  );
};

/* ================= STYLES ================= */



export default QuotationScreen;
