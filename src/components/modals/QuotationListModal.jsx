


import { useState, useEffect } from "react";
import {
  X,
  Eye,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FetchQuoteByTripID } from "../../api/leads/FetchLeads";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import PdfPreviewModal from "./PdfPreviewModal";

const API_URL =
  "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html";

/* ---------------- HEADER ---------------- */

const QuotationHeader = ({ onClose }) => (
  <div className="bg-purple-600 p-4 rounded-b-3xl flex justify-between items-center">
    <div>
      <h2 className="text-white text-xl font-bold">
        Journey Routers
      </h2>
      <p className="text-white/80 text-sm">
        Quotation Management
      </p>
    </div>
    <button
      onClick={onClose}
      className="bg-white/20 p-2 rounded-full"
    >
      <X size={18} className="text-white" />
    </button>
  </div>
);

/* ---------------- MAIN MODAL ---------------- */

export default function QuotationListModal({
  visible,
  onClose,
  tripId,
  data
}) {
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPrevious, setShowPrevious] = useState(false);

  // Preview related state
  const [pdfHtml, setPdfHtml] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  /* ---------------- FETCH QUOTATIONS ---------------- */

  const fetchQuotations = async (id) => {
    try {
      if (!id) throw new Error("Trip ID required");

      setLoading(true);
      setError(null);

      const response = await FetchQuoteByTripID(id);
      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      const sorted = data.sort(
        (a, b) =>
          new Date(b.CreatedAt || 0) -
          new Date(a.CreatedAt || 0)
      );

      setQuotations(sorted);
    } catch (err) {
      console.error(err);
      setError("Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && tripId) {
      fetchQuotations(tripId);
    }
  }, [visible, tripId]);

  /* ---------------- PREVIEW HANDLER ---------------- */

  const handlePreview = async (quotation) => {
    try {
      setSelectedQuotation(quotation);

      const response = await axios.post(API_URL, {
        type: "quotation",
        mode: "html",
        tripId,
        quoteId: quotation.QuoteId,
        templateName: "ip_pdf.hbs",
      });

      if (!response.data) {
        throw new Error("HTML not returned");
      }

      setPdfHtml(response.data);
      setShowPdfModal(true);
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Failed to load preview");
    }
  };

  if (!visible) return null;

  const latest = quotations[0];
  const previous = quotations.slice(1);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-gray-50 w-full max-w-lg max-h-[90vh] rounded-2xl overflow-hidden shadow-xl">
          <QuotationHeader onClose={onClose} />

          <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">

            {loading && (
              <p className="text-center py-6">
                Loading quotations...
              </p>
            )}

            {error && (
              <p className="text-center text-red-500">
                {error}
              </p>
            )}

            {!loading && quotations.length === 0 && (
              <p className="text-center text-gray-500 py-6">
                No quotations found.
              </p>
            )}

            {/* LATEST */}
            {latest && (
              <div className="bg-white p-4 mb-4 rounded-xl border border-purple-300">
                <p className="text-xs text-gray-500 mb-1">
                  LATEST QUOTATION
                </p>

                <div className="flex justify-between items-center">
                  <p className="text-purple-600 font-bold text-lg">
                    {latest.QuoteId}
                  </p>

                  <div className="flex gap-2">
                    <button
                      className="bg-blue-100 p-2 rounded-full"
                      onClick={() => handlePreview(latest)}
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>

                    <button
                      className="bg-gray-100 p-2 rounded-full"
                      onClick={() => {
                        onClose();
                        navigate("/create-newquote", {
                          state: {
                            followUpData: {
                              ...latest,
                              company: data?.company,
                              LeadId: data?.LeadId,
                              CreatedAt: data?.CreatedAt,
                            },
                          },
                        });
                      }}
                    >
                      <FileText size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-900 font-semibold mt-2">
                  ₹
                  {latest.Costs?.TotalCost?.toLocaleString(
                    "en-IN"
                  ) || "0"}
                </p>
              </div>
            )}

            {/* TOGGLE PREVIOUS */}
            {previous.length > 0 && (
              <button
                onClick={() =>
                  setShowPrevious(!showPrevious)
                }
                className="flex items-center justify-center w-full py-3 mb-4 text-purple-600 font-medium"
              >
                {showPrevious
                  ? "Hide"
                  : "Show"}{" "}
                Previous Quotations ({previous.length})
                {showPrevious ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            )}

            {/* PREVIOUS LIST */}
            {showPrevious &&
              previous.map((quotation) => (
                <div
                  key={quotation.QuoteId}
                  className="bg-white p-4 mb-4 rounded-xl border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {quotation.QuoteId}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          quotation.CreatedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      className="bg-blue-100 p-2 rounded-full"
                      onClick={() =>
                        handlePreview(quotation)
                      }
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                  </div>

                  <p className="mt-2 font-semibold">
                    ₹
                    {quotation.Costs?.TotalCost?.toLocaleString(
                      "en-IN"
                    ) || "0"}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* PDF PREVIEW MODAL */}
      <PdfPreviewModal
       onShare={()=>{
          setShowPdfModal(false);
        }}
        visible={showPdfModal}
        pdfHtml={pdfHtml}
        clientName={
          selectedQuotation?.QuoteId || "Quotation"
        }
        onClose={() => {
          setShowPdfModal(false);
          setSelectedQuotation(null);
        }}
      />
    </>
  );
}
