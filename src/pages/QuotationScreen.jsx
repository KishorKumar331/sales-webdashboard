import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import IntegratedQuotationForm from "../components/Forms/IntegratedQuotationForm";
import { clearQuotationDraft } from "../storage/quotationDraft";
import PdfPreviewModal from "../components/modals/PdfPreviewModal";
import { useAuth } from "../hooks/useAuth";

const QuotationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get lead data from navigation state
  const leadData = location.state?.leadData || null;
  const followUpData = location.state?.followUpData || null;
  const { realUser: user } = useAuth();
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
    console.log(data)
    if (isPrinting) return;
    setIsPrinting(true);

    try {
      const dataWithUser = {
        ...data,
        company: user?.user?.company
      };

      console.log("Data with user:", dataWithUser);
      // Pdf Api
      const response = await axios.post(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html",
        {
          mode: "html",
          type: "quotation",
          data: dataWithUser,
        }
      );

      if (response.data) {
        console.log("HTML Content received from API");
        setPdfHtml(response.data);

        setPdfUri(null);
        setFormDataToSubmit({
          ...data,
          company: user?.user?.company,
          CompanyEmail: user?.user?.Email,
        });
        setShowPdfModal(true);
        setRefreshKey((prev) => prev + 1);
        console.log("✅ HTML set for preview");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("❌ Error generating preview:", error);
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
      return;
    }

    try {

      const res = await axios.post(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/quotations",
        { ...formDataToSubmit, CompanyEmail: user?.user?.Email }
      );

      console.log("✅ Quotation created:", res.data);

      const updateData = {
        TripId: leadData?.TripId || followUpData?.TripId,
        CreatedAt: leadData?.CreatedAt || followUpData?.CreatedAt,
        company: leadData?.company || followUpData?.company,
        quotations: Array.isArray(leadData?.quotations) || Array.isArray(followUpData?.quotations)
          ? [...(leadData?.quotations || followUpData?.quotations || []), res.data.QuoteId]
          : [res.data.QuoteId],
        latestStatus: "Cold",
        latestQuotationId: res.data.QuoteId,
        LeadId: leadData?.LeadId || followUpData?.LeadId,
      };

      await axios.put(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote",
        updateData
      );

      await clearQuotationDraft(formDataToSubmit.TripId);

      navigate("/")
    } catch (error) {
      console.error("❌ Error submitting:", error);

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
        data={formDataToSubmit}
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
