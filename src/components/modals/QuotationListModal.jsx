// // import { useState, useEffect } from "react";
// // import {
// //   X,
// //   Eye,
// //   FileText,
// //   ChevronDown,
// //   ChevronUp,
// // } from "lucide-react";
// // import { FetchQuoteByTripID } from "../../api/leads/FetchLeads";
// // import { useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { toast } from "react-toastify";
// // import PdfPreviewModal from "./PdfPreviewModal";

// // /* ---------------- HEADER ---------------- */

// // const QuotationHeader = ({ onClose }) => (
// //   <div className="bg-purple-600 p-4  rounded-b-3xl flex justify-between items-center">
// //     <div>
// //       <h2 className="text-white text-xl font-bold">Journey Routers</h2>
// //       <p className="text-white/80 text-sm">Quotation Management</p>
// //     </div>
// //     <button
// //       onClick={onClose}
// //       className="bg-white/20 p-2 rounded-full"
// //     >
// //       <X size={18} className="text-white" />
// //     </button>
// //   </div>
// // );

// // /* ---------------- MAIN MODAL ---------------- */

// // export default function QuotationListModal({
// //   visible,
// //   onClose,
// //   tripId,
// // }) {
// //   const router = useNavigate();

// //   const [quotations, setQuotations] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [showPrevious, setShowPrevious] = useState(false);
// //   const [showPdfModal, setShowPdfModal] = useState(false);
// //   const [selectedQuotation, setSelectedQuotation] = useState(null);
// //   const [pdfHtml, setPdfHtml] = useState(null);
// //   const [pdfUri, setPdfUri] = useState(null);
// //   const [refreshKey, setRefreshKey] = useState(0);
// //   const [formDataToSubmit, setFormDataToSubmit] = useState(null);

// //   // Get user data from localStorage
// //   const user = JSON.parse(localStorage.getItem('userProfile') || '{}');

// //   const latest = quotations[0];
// //   const previous = quotations.slice(1);
// //   const onViewQuotation = async (quotation) => {
// //     try {
// //       const response = await axios.post(
// //         "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html",
// //         {
// //           type: "quotation",
// //           renderOnly: true,
// //           data: {
// //             ...quotation,
// //             user,
// //           },
// //           templateName: "ip_pdf.hbs",
// //         }
// //       );

// //       if (response.data) {
// //         setPdfHtml(response.data);
// //         setPdfUri(null);
// //         setFormDataToSubmit(quotation);
// //         setShowPdfModal(true);
// //         setRefreshKey((prev) => prev + 1);
// //       } else {
// //         throw new Error("No data received from server");
// //       }
// //     } catch (error) {
// //       console.error("Error generating preview:", error);
// //       toast.error("Failed to load quotation preview. Please try again.");
// //     } finally {
// //         // setIsPrinting(false);
// //     }
// //   };
// //   const fetchQuotations = async (id) => {
// //     try {
// //       if (!id) throw new Error("No trip ID provided");

// //       setLoading(true);
// //       setError(null);

// //       const response = await FetchQuoteByTripID(id);
// //       const data = Array.isArray(response?.data) ? response.data : [];

// //       const sorted = data.sort(
// //         (a, b) =>
// //           new Date(b.CreatedAt || 0) -
// //           new Date(a.CreatedAt || 0)
// //       );

// //       setQuotations(sorted);
// //     } catch (err) {
// //       console.error(err);
// //       setError("Failed to load quotations.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleViewPdf = (quotation) => {
// //     setSelectedQuotation(quotation);
// //     setShowPdfModal(true);
// //   };

// //   const handleSharePdf = async () => {
// //     // This would be called after PDF is generated/downloaded
// //     // You can add API call here to update quotation status or send notification
// //     console.log('PDF shared for quotation:', selectedQuotation?.QuoteId);
// //   };

// //   useEffect(() => {
// //     if (visible && tripId) {
// //       fetchQuotations(tripId);
// //     }
// //   }, [visible, tripId]);

// //   if (!visible) return null;

// //   return (
// //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
// //       <div className="bg-gray-50 w-full max-w-lg max-h-[90vh] rounded-2xl overflow-hidden shadow-xl">
// //         <QuotationHeader onClose={onClose} />

// //         {/* CONTENT */}
// //         <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
// //           {loading && (
// //             <div className="flex flex-col items-center py-10">
// //               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
// //               <p className="mt-3 text-gray-600">
// //                 Loading quotations...
// //               </p>
// //             </div>
// //           )}

// //           {error && (
// //             <p className="text-center text-red-500 mt-6">
// //               {error}
// //             </p>
// //           )}

// //           {!loading && quotations.length === 0 && (
// //             <p className="text-center text-gray-500 mt-6">
// //               No quotations found.
// //             </p>
// //           )}

// //           {/* LATEST QUOTATION */}
// //           {latest && (
// //             <div className="bg-white p-4 mb-4 rounded-xl border border-purple-300">
// //               <p className="text-xs text-gray-500 font-medium mb-1">
// //                 LATEST QUOTATION
// //               </p>

// //               <div className="flex justify-between items-center">
// //                 <p className="text-purple-600 font-bold text-lg">
// //                   {latest.QuoteId}
// //                 </p>

// //                 <div className="flex gap-2">
// //                   <button
// //                     className="bg-blue-100 p-2 rounded-full"
// //                     onClick={() => onViewQuotation(latest)}
// //                   >
// //                     <Eye size={16} className="text-blue-600" />
// //                   </button>

// //                   <button
// //                     className="bg-gray-100 p-2 rounded-full"
// //                     onClick={() => {
// //                       onClose();
// //                       router('/create-newquote', { 
// //                         state: { 
// //                           followUpData: {
// //                             ...latest,
// //                             Quotations: [latest.QuoteId]
// //                           }
// //                         } 
// //                       });
// //                     }}
// //                   >
// //                     <FileText size={16} className="text-gray-600" />
// //                   </button>
// //                 </div>
// //               </div>

// //               <p className="text-gray-900 font-semibold text-lg mt-2">
// //                 ₹{latest.Costs?.TotalCost?.toLocaleString("en-IN") || "0"}
// //               </p>
// //             </div>
// //           )}

// //           {/* TOGGLE PREVIOUS */}
// //           {previous.length > 0 && (
// //             <button
// //               onClick={() => setShowPrevious(!showPrevious)}
// //               className="flex items-center justify-center w-full py-3 mb-4 text-purple-600 font-medium"
// //             >
// //               {showPrevious ? "Hide" : "Show"} Previous Quotations (
// //               {previous.length})
// //               {showPrevious ? (
// //                 <ChevronUp size={16} className="ml-1" />
// //               ) : (
// //                 <ChevronDown size={16} className="ml-1" />
// //               )}
// //             </button>
// //           )}

// //           {/* PREVIOUS QUOTATIONS */}
// //           {showPrevious &&
// //             previous.map((quotation) => (
// //               <div
// //                 key={quotation.QuoteId}
// //                 className="bg-white p-4 mb-4 rounded-xl border border-gray-200"
// //               >
// //                 <p className="text-xs text-gray-500 font-medium mb-1">
// //                   PREVIOUS QUOTATION
// //                 </p>

// //                 <div className="flex justify-between items-center">
// //                   <div>
// //                     <p className="text-gray-700 font-semibold">
// //                       {quotation.QuoteId}
// //                     </p>
// //                     <p className="text-gray-500 text-sm">
// //                       {new Date(
// //                         quotation.CreatedAt
// //                       ).toLocaleDateString()}
// //                     </p>
// //                   </div>

// //                   <div className="flex gap-2">
// //                     <button
// //                       className="bg-blue-100 p-2 rounded-full"
// //                       onClick={() => onViewQuotation(quotation)}
// //                     >
// //                       <Eye size={16} className="text-blue-600" />
// //                     </button>

// //                     <button
// //                       className="bg-gray-100 p-2 rounded-full"
// //                       onClick={() => {
// //                         onClose();
// //                         router('/create-newquote', { 
// //                           state: { 
// //                             followUpData: {
// //                               ...quotation,
// //                               Quotations: [quotation.QuoteId]
// //                             }
// //                           } 
// //                         });
// //                       }}
// //                     >
// //                       <FileText size={16} className="text-gray-600" />
// //                     </button>
// //                   </div>
// //                 </div>

// //                 <p className="text-gray-900 font-semibold mt-2">
// //                   ₹{quotation.Costs?.TotalCost?.toLocaleString("en-IN") || "0"}
// //                 </p>
// //               </div>
// //             ))}
// //         </div>
// //       </div>

// //       {/* PDF Preview Modal */}
// //       <PdfPreviewModal
// //         visible={showPdfModal}
// //         pdfUri={pdfUri}
// //         pdfHtml={pdfHtml}
// //         onClose={() => {
// //           setShowPdfModal(false);
// //           setSelectedQuotation(null);
// //         }}
// //         onShare={handleSharePdf}
// //         clientName={selectedQuotation?.ClientName || selectedQuotation?.QuoteId || 'Quotation'}
// //         key={refreshKey}
// //       />
// //     </div>
// //   );
// // }


// import { useState, useEffect, useCallback } from "react";
// import {
//   X,
//   Eye,
//   FileText,
//   ChevronDown,
//   ChevronUp,
//   Download,
// } from "lucide-react";
// import { FetchQuoteByTripID } from "../../api/leads/FetchLeads";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import PdfPreviewModal from "./PdfPreviewModal";

// /* ---------------- HEADER ---------------- */

// const QuotationHeader = ({ onClose }) => (
//   <div className="bg-purple-600 p-4 rounded-b-3xl flex justify-between items-center">
//     <div>
//       <h2 className="text-white text-xl font-bold">Journey Routers</h2>
//       <p className="text-white/80 text-sm">Quotation Management</p>
//     </div>
//     <button onClick={onClose} className="bg-white/20 p-2 rounded-full">
//       <X size={18} className="text-white" />
//     </button>
//   </div>
// );

// /* ---------------- MAIN MODAL ---------------- */

// export default function QuotationListModal({
//   visible,
//   onClose,
//   tripId,
// }) {
//   const navigate = useNavigate();

//   const [quotations, setQuotations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showPrevious, setShowPrevious] = useState(false);

//   const [pdfHtml, setPdfHtml] = useState(null);
//   const [selectedQuotation, setSelectedQuotation] = useState(null);
//   const [showPdfModal, setShowPdfModal] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const user = JSON.parse(localStorage.getItem("userProfile") || "{}");

//   /* ---------------- FETCH QUOTATIONS ---------------- */

//   const fetchQuotations = async (id) => {
//     try {
//       if (!id) throw new Error("No trip ID provided");

//       setLoading(true);
//       setError(null);

//       const response = await FetchQuoteByTripID(id);
//       const data = Array.isArray(response?.data) ? response.data : [];

//       const sorted = data.sort(
//         (a, b) =>
//           new Date(b.CreatedAt || 0) -
//           new Date(a.CreatedAt || 0)
//       );

//       setQuotations(sorted);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load quotations.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (visible && tripId) {
//       fetchQuotations(tripId);
//     }
//   }, [visible, tripId]);

//   /* ---------------- PREVIEW HTML ---------------- */

//   const onViewQuotation = async (quotation) => {
//     try {
//       setSelectedQuotation(quotation);

//       const response = await axios.post(
//         "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html",
//         {
//           type: "quotation",
//           mode: "html",
//           tripId,
//           quoteId: quotation.QuoteId,
//           templateName: "ip_pdf.hbs",
//           user,
//         }
//       );

//       if (!response.data) {
//         throw new Error("No preview data received");
//       }

//       setPdfHtml(response.data);
//       setShowPdfModal(true);
//       setRefreshKey((prev) => prev + 1);
//     } catch (error) {
//       console.error("Preview error:", error);
//       toast.error("Failed to load quotation preview");
//     }
//   };

//   /* ---------------- DOWNLOAD PDF ---------------- */

//   const handleDownloadPdf = useCallback(async () => {
//     try {
//       if (!selectedQuotation) {
//         toast.error("No quotation selected");
//         return;
//       }

//       const response = await axios.post(
//         "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html",
//         {
//           type: "quotation",
//           mode: "pdf",
//           tripId,
//           quoteId: selectedQuotation.QuoteId,
//           templateName: "ip_pdf.hbs",
//         },
//         { responseType: "blob" }
//       );

//       const file = new Blob([response.data], {
//         type: "application/pdf",
//       });

//       const url = window.URL.createObjectURL(file);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `${selectedQuotation.QuoteId}.pdf`;

//       document.body.appendChild(link);
//       link.click();

//       link.remove();
//       window.URL.revokeObjectURL(url);

//       toast.success("PDF downloaded successfully");
//     } catch (error) {
//       console.error("Download error:", error);
//       toast.error("Failed to download PDF");
//     }
//   }, [selectedQuotation, tripId]);

//   if (!visible) return null;

//   const latest = quotations[0];
//   const previous = quotations.slice(1);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="bg-gray-50 w-full max-w-lg max-h-[90vh] rounded-2xl overflow-hidden shadow-xl">
//         <QuotationHeader onClose={onClose} />

//         <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
//           {loading && <p>Loading...</p>}
//           {error && <p className="text-red-500">{error}</p>}

//           {latest && (
//             <div className="bg-white p-4 mb-4 rounded-xl border border-purple-300">
//               <p className="text-xs text-gray-500 mb-1">
//                 LATEST QUOTATION
//               </p>

//               <div className="flex justify-between items-center">
//                 <p className="text-purple-600 font-bold">
//                   {latest.QuoteId}
//                 </p>

//                 <div className="flex gap-2">
//                   <button
//                     className="bg-blue-100 p-2 rounded-full"
//                     onClick={() => onViewQuotation(latest)}
//                   >
//                     <Eye size={16} className="text-blue-600" />
//                   </button>

//                   <button
//                     className="bg-green-100 p-2 rounded-full"
//                     onClick={handleDownloadPdf}
//                   >
//                     <Download size={16} className="text-green-600" />
//                   </button>

//                   <button
//                     className="bg-gray-100 p-2 rounded-full"
//                     onClick={() => {
//                       onClose();
//                       navigate("/create-newquote", {
//                         state: {
//                           followUpData: {
//                             ...latest,
//                             Quotations: [latest.QuoteId],
//                           },
//                         },
//                       });
//                     }}
//                   >
//                     <FileText size={16} className="text-gray-600" />
//                   </button>
//                 </div>
//               </div>

//               <p className="text-gray-900 font-semibold mt-2">
//                 ₹{latest.Costs?.TotalCost?.toLocaleString("en-IN") || "0"}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* PDF Preview */}
//       <PdfPreviewModal
//         visible={showPdfModal}
//         pdfHtml={pdfHtml}
//         onDownload={handleDownloadPdf}
//         onClose={() => {
//           setShowPdfModal(false);
//           setSelectedQuotation(null);
//         }}
//         key={refreshKey}
//       />
//     </div>
//   );
// }


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
                              Quotations: [
                                latest.QuoteId,
                              ],
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
