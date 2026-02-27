import React, { useState } from "react";
import {
  X,
  User,
  Calendar,
  Plane,
  Receipt,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import PdfPreviewModal from "./PdfPreviewModal";
import axios from "axios";
import { toast } from "react-toastify";

/* ------------------ REUSABLE UI ------------------ */

const DetailCard = ({ title, children, icon }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
    <div className="flex items-center mb-2">
      {icon && <div className="mr-2">{icon}</div>}
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailRow = ({ label, value, isLast }) => (
  <div
    className={`flex justify-between py-2 ${
      !isLast ? "border-b border-gray-100" : ""
    }`}
  >
    <span className="text-gray-600">{label}</span>
    <span className="text-gray-800 font-medium text-right ml-4">
      {value || "N/A"}
    </span>
  </div>
);

/* ------------------ MODAL ------------------ */
const API_URL =
  "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html";

export default function QuoteDetailsModal({ visible, onClose, quote }) {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfHtml, setPdfHtml] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

 const handleInvoicePreview = async (quotation) => {
    try {
      const response = await axios.post(API_URL, {
          type: "quotation",
        mode: "html",
        tripId: quotation.TripId,
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

  if (!quote) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white p-6 rounded-xl text-center">
          <FileText size={48} className="mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">
            No quote details available
          </p>
          <button
            onClick={onClose}
            className="mt-6 bg-purple-100 px-6 py-3 rounded-lg text-purple-600 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  const formatCurrency = (a) =>
    a !== undefined && a !== null
      ? `₹${parseInt(a).toLocaleString("en-IN")}`
      : "N/A";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
      <div className="bg-gray-50 w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              Quote #{quote.QuoteId}
            </h2>
            <p className="text-sm text-purple-100">
              Trip ID: {quote.TripId || "N/A"}
            </p>
            <p className="text-sm text-purple-100">
              Created: {formatDate(quote.CreatedAt)}
            </p>
          </div>
          <button onClick={onClose}>
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* CONTACT */}
          <DetailCard
            title="Contact Information"
            icon={<User size={18} className="text-purple-600" />}
          >
            <DetailRow label="Customer Name" value={quote.clientName || quote["Client-Name"]} />
            <DetailRow label="Email" value={quote.clientEmail || quote["Client-Email"]} />
            <DetailRow
              label="Phone"
              value={quote.clientContact || quote["Client-Contact"]}
              isLast
            />
          </DetailCard>

          {/* TRIP SUMMARY */}
          <DetailCard
            title="Trip Summary"
            icon={<Plane size={18} className="text-purple-600" />}
          >
            <DetailRow
              label="Destination"
              value={quote.destination || quote.DestinationName}
            />
            <DetailRow
              label="Travel Dates"
              value={`${formatDate(
                quote.travelDate || quote.TravelDate
              )} - ${formatDate(quote.travelEndDate || quote.TravelEndDate)}`}
            />
            <DetailRow
              label="Travelers"
              value={`${quote.pax || quote.NoOfPax} Adults ${
                (quote.child || quote.Child) > 0 ? `, ${quote.child || quote.Child} Children` : ""
              }`}
            />
            <DetailRow
              label="Duration"
              value={`${quote.days || quote.Days} Days / ${quote.nights || quote.Nights} Nights`}
              isLast
            />
            <div className="bg-blue-50 p-3 rounded-lg mt-3 text-center font-medium text-blue-800">
              Total Package Price:{" "}
              {formatCurrency(quote.Costs?.TotalCost)}
            </div>
          </DetailCard>

          {/* PRICE BREAKDOWN */}
          {quote.Costs && (
            <DetailCard
              title="Price Breakdown"
              icon={<Receipt size={18} className="text-purple-600" />}
            >
              <DetailRow
                label="Package Cost"
                value={formatCurrency(
                  quote.Costs.LandPackageCost
                )}
              />
              <DetailRow
                label="Flight Cost"
                value={formatCurrency(quote.Costs.FlightCost)}
              />
              <DetailRow
                label="Visa Cost"
                value={formatCurrency(quote.Costs.VisaCost)}
              />
              {quote.Costs.GSTAmount > 0 && (
                <DetailRow
                  label="GST"
                  value={formatCurrency(quote.Costs.GSTAmount)}
                />
              )}
              {quote.Costs.TCSAmount > 0 && (
                <DetailRow
                  label="TCS"
                  value={formatCurrency(quote.Costs.TCSAmount)}
                />
              )}
              <DetailRow
                label="Total Amount"
                value={formatCurrency(quote.Costs?.TotalCost || quote.totalAmount)}
                isLast
              />
            </DetailCard>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-gray-100 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-purple-600 text-purple-600 py-3 rounded-lg font-medium"
          >
            Close
          </button>
          <button
            onClick={() => handleInvoicePreview(quote)}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium"
          >
            Share Quote
          </button>
        </div>
      </div>
        <PdfPreviewModal
        visible={showPdfModal}
        pdfHtml={pdfHtml}
        clientName={
           "Quotation"
        }
        onClose={() => {
          setShowPdfModal(false);
          setSelectedQuotation(null);
        }}
      />
    </div>
  );
}
