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

/* ---------------- HEADER ---------------- */

const QuotationHeader = ({ onClose }) => (
  <div className="bg-purple-600 p-4 pt-10 rounded-b-3xl flex justify-between items-center">
    <div>
      <h2 className="text-white text-xl font-bold">Journey Routers</h2>
      <p className="text-white/80 text-sm">Quotation Management</p>
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
  onViewQuotation,
}) {
  const router = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrevious, setShowPrevious] = useState(false);

  const latest = quotations[0];
  const previous = quotations.slice(1);

  const fetchQuotations = async (id) => {
    try {
      if (!id) throw new Error("No trip ID provided");

      setLoading(true);
      setError(null);

      const response = await FetchQuoteByTripID(id);
      const data = Array.isArray(response?.data) ? response.data : [];

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

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-gray-50 w-full max-w-lg max-h-[90vh] rounded-2xl overflow-hidden shadow-xl">
        <QuotationHeader onClose={onClose} />

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex flex-col items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              <p className="mt-3 text-gray-600">
                Loading quotations...
              </p>
            </div>
          )}

          {error && (
            <p className="text-center text-red-500 mt-6">
              {error}
            </p>
          )}

          {!loading && quotations.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              No quotations found.
            </p>
          )}

          {/* LATEST QUOTATION */}
          {latest && (
            <div className="bg-white p-4 mb-4 rounded-xl border border-purple-300">
              <p className="text-xs text-gray-500 font-medium mb-1">
                LATEST QUOTATION
              </p>

              <div className="flex justify-between items-center">
                <p className="text-purple-600 font-bold text-lg">
                  {latest.QuoteId}
                </p>

                <div className="flex gap-2">
                  <button
                    className="bg-blue-100 p-2 rounded-full"
                    onClick={() => onViewQuotation(latest)}
                  >
                    <Eye size={16} className="text-blue-600" />
                  </button>

                  <button
                    className="bg-gray-100 p-2 rounded-full"
                    onClick={() => {
                      onClose();
                      router(
                        `/QuotationScreen?FollowleadData=${encodeURIComponent(
                          JSON.stringify(latest)
                        )}`
                      );
                    }}
                  >
                    <FileText size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <p className="text-gray-900 font-semibold text-lg mt-2">
                ₹{latest.Costs?.TotalCost?.toLocaleString("en-IN") || "0"}
              </p>
            </div>
          )}

          {/* TOGGLE PREVIOUS */}
          {previous.length > 0 && (
            <button
              onClick={() => setShowPrevious(!showPrevious)}
              className="flex items-center justify-center w-full py-3 mb-4 text-purple-600 font-medium"
            >
              {showPrevious ? "Hide" : "Show"} Previous Quotations (
              {previous.length})
              {showPrevious ? (
                <ChevronUp size={16} className="ml-1" />
              ) : (
                <ChevronDown size={16} className="ml-1" />
              )}
            </button>
          )}

          {/* PREVIOUS QUOTATIONS */}
          {showPrevious &&
            previous.map((quotation) => (
              <div
                key={quotation.QuoteId}
                className="bg-white p-4 mb-4 rounded-xl border border-gray-200"
              >
                <p className="text-xs text-gray-500 font-medium mb-1">
                  PREVIOUS QUOTATION
                </p>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700 font-semibold">
                      {quotation.QuoteId}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(
                        quotation.CreatedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="bg-blue-100 p-2 rounded-full"
                      onClick={() => onViewQuotation(quotation)}
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>

                    <button
                      className="bg-gray-100 p-2 rounded-full"
                      onClick={() => {
                        onClose();
                        router.push(
                          `/QuotationScreen?FollowleadData=${encodeURIComponent(
                            JSON.stringify(quotation)
                          )}`
                        );
                      }}
                    >
                      <FileText size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-900 font-semibold mt-2">
                  ₹{quotation.Costs?.TotalCost?.toLocaleString("en-IN") || "0"}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
