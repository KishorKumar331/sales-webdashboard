import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import PdfPreviewModal from "../modals/PdfPreviewModal";
import CustomPicker from "../CustomPicker";
import { getUserProfile } from "../../utils/getUserProfile";

export default function InvoiceForm({
  tripId,
  onSubmit,
  initialData = null,
}) {
  const query = useQueryClient();

  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfHtml, setPdfHtml] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    tripId: tripId || "",
    finalPackageQuotationId: "",
    customer: {
      name: "",
      email: "",
      contact: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
    },
    destination: "",
    travelDate: "",
    pricing: {
      totalAmount: 0,
      gstAmount: 0,
      tcsAmount: 0,
    },
    payment: {
      installments: [
        {
          installmentAmount: 0,
          installmentDate: "",
        },
      ],
    },
    notes: "",
  });

  // ===============================
  // LOAD USER PROFILE
  // ===============================
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      setUserProfile(profile);
    };
    loadProfile();
  }, []);

  // ===============================
  // FETCH QUOTATIONS
  // ===============================
  useEffect(() => {
    if (!tripId) return;

    const fetchQuotes = async () => {
      try {
        setLoadingQuotes(true);
        const res = await fetch(
          `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/quotations?TripId=${tripId}`
        );

        const data = await res.json();
        setQuotations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        window.alert("Failed to load quotations");
      } finally {
        setLoadingQuotes(false);
      }
    };

    fetchQuotes();
  }, [tripId]);

  // ===============================
  // HELPERS
  // ===============================
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNested = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const calculateInvoiceTotal = () => {
    return (
      Number(formData.pricing.totalAmount || 0) +
      Number(formData.pricing.gstAmount || 0) +
      Number(formData.pricing.tcsAmount || 0)
    );
  };

  // ===============================
  // PREVIEW
  // ===============================
  const handleOpenPreview = async () => {
    if (!formData.finalPackageQuotationId) {
      window.alert("Please select quotation");
      return;
    }

    try {
      setIsGeneratingPdf(true);

      const response = await axios.post(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html",
        {
          type: "invoice",
          renderOnly: true,
          data: { ...formData, user: userProfile },
          templateName: "invoiceip.hbs",
        }
      );

      setPdfHtml(response.data);
      setShowPdfModal(true);
    } catch (err) {
      console.error(err);
      window.alert("Failed to generate preview");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmitInvoice = async () => {
    try {
      const response = await fetch(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/invoice-management/invoice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed");

      await query.invalidateQueries({ queryKey: ["followup"] });

      window.alert("Invoice submitted successfully");
      setShowPdfModal(false);
      onSubmit && onSubmit();
    } catch (err) {
      window.alert("Error saving invoice");
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold">Create Invoice</h1>
        </div>

        {/* QUOTATION */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Select Quotation</h2>

          {loadingQuotes ? (
            <p>Loading...</p>
          ) : (
            <CustomPicker
              items={quotations.map((q) => ({
                label: `${q.QuoteId}`,
                value: q.QuoteId,
              }))}
              selectedValue={formData.finalPackageQuotationId}
              onValueChange={(value) =>
                updateField("finalPackageQuotationId", value)
              }
            />
          )}
        </div>

        {/* CUSTOMER */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold">Customer Details</h2>

          <input
            className="input"
            placeholder="Customer Name"
            value={formData.customer.name}
            onChange={(e) =>
              updateNested("customer", "name", e.target.value)
            }
          />

          <input
            className="input"
            placeholder="Email"
            value={formData.customer.email}
            onChange={(e) =>
              updateNested("customer", "email", e.target.value)
            }
          />

          <input
            className="input"
            placeholder="Contact"
            value={formData.customer.contact}
            onChange={(e) =>
              updateNested("customer", "contact", e.target.value)
            }
          />
        </div>

        {/* FINANCIAL */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold">Financial Details</h2>

          <input
            type="number"
            className="input"
            placeholder="Package Amount"
            value={formData.pricing.totalAmount}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pricing: {
                  ...prev.pricing,
                  totalAmount: Number(e.target.value),
                },
              }))
            }
          />

          <input
            type="number"
            className="input"
            placeholder="GST"
            value={formData.pricing.gstAmount}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pricing: {
                  ...prev.pricing,
                  gstAmount: Number(e.target.value),
                },
              }))
            }
          />

          <input
            type="number"
            className="input"
            placeholder="TCS"
            value={formData.pricing.tcsAmount}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pricing: {
                  ...prev.pricing,
                  tcsAmount: Number(e.target.value),
                },
              }))
            }
          />

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="font-bold text-purple-700">
              Invoice Total: ₹{calculateInvoiceTotal()}
            </p>
          </div>
        </div>

        {/* NOTES */}
        <div className="bg-white p-6 rounded-xl shadow">
          <textarea
            className="w-full border rounded-lg p-3"
            placeholder="Notes..."
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4">
          <button
            onClick={handleOpenPreview}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg"
          >
            {isGeneratingPdf ? "Preparing..." : "Preview & Save"}
          </button>
        </div>

      </div>

      <PdfPreviewModal
        visible={showPdfModal}
        pdfHtml={pdfHtml}
        onClose={() => setShowPdfModal(false)}
        onShare={handleSubmitInvoice}
      />
    </div>
  );
}
