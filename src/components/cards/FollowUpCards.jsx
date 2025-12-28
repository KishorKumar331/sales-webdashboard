import React, { useState, useRef, useMemo } from "react";
import {
  Phone,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Receipt,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import QuotationListModal from "../modals/QuotationListModal";
import InvoiceListModal from "../modals/InvoiceListModal";
import { useNavigate } from "react-router-dom";
import useStatusChange from "../../hooks/useStatusChange";

const FollowUpCards = ({ data }) => {
  const router = useNavigate();

  const [currentPage, setCurrentPage] = useState(0);
  const [notes, setNotes] = useState(
    data?.Comments?.[0]?.Message || "No notes yet."
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const [isDocumentModalVisible, setIsDocumentModalVisible] = useState(false);
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [isQuotationModalVisible, setIsQuotationModalVisible] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const { status, isLoading, updateStatus } = useStatusChange(
    data?.Status || "New",
    data
  );

  // Remove fixed width calculation to allow full width
  const cardWidth = '100%';

  const pages = useMemo(() => ["page1", "page2"], []);

  const handleCreateNewInvoice = () => {
    router(
      `/invoices/create?tripId=${data?.TripId}&initialData=${encodeURIComponent(
        JSON.stringify(data)
      )}`
    );
    setIsInvoiceModalVisible(false);
  };

  const handleActionPress = (action) => {
    if (action === "Documents") setIsDocumentModalVisible(true);
    else if (action === "Invoices") setIsInvoiceModalVisible(true);
    else if (action === "Quotes & PDFs") setIsQuotationModalVisible(true);
    else window.alert(action);
  };

  const renderPage1 = () => (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-semibold">
            Trip #{data.TripId || data?.QuoteId?.slice(0, 6)}
          </span>

          <div className="mt-2">
            <span className="font-medium mr-2">{data["Client-Name"]}</span>
            <span className="text-gray-500 text-sm">
              {data["Client-Email"]}
            </span>
          </div>

          <a
            href={`tel:${data["Client-Contact"]}`}
            className="flex items-center text-green-600 text-sm mt-1"
          >
            <Phone size={14} className="mr-1" />
            {data["Client-Contact"] || "No contact"}
          </a>
        </div>

        <button
          onClick={() => setCurrentPage(1)}
          className="bg-gray-100 p-2 rounded-full"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Route */}
      <div className="bg-gray-50 p-3 rounded mb-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">From</p>
          <p>{data["Client-DepartureCity"] || "N/A"}</p>
        </div>

        <ChevronRight className="text-gray-400" size={16} />

        <div>
          <p className="text-xs text-gray-500">To</p>
          <p>{data["Client-Destination"] || "N/A"}</p>
        </div>

        <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center">
          <Calendar size={12} className="mr-1" />
          {new Date(data["Client-TravelDate"]).toLocaleDateString()}
        </div>
      </div>

      {/* Budget */}
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500">Budget</p>
          <p className="text-purple-600 font-bold">
            ₹{data["Client-Budget"]?.toLocaleString() || "N/A"}
          </p>
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-gray-500">PAX</p>
            {data["Client-Adults"] || 0}
          </div>
          <div>
            <p className="text-gray-500">Child</p>
            {data["Client-Children"] || 0}
          </div>
          <div>
            <p className="text-gray-500">Infant</p>
            {data["Client-Infants"] || 0}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div>
      {/* Status */}
      <div className="flex justify-between mb-4">
        <span className="bg-purple-100 px-2 py-1 rounded text-xs font-semibold">
          Trip #{data.TripId}
        </span>

        <button
          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
          className="border px-3 py-1 rounded flex items-center gap-2"
        >
          {status === "Converted" && <CheckCircle size={16} className="text-green-600" />}
          {status === "Dumped" && <XCircle size={16} className="text-red-600" />}
          <span>{status}</span>
          {isStatusDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isStatusDropdownOpen && (
        <div className="border rounded mb-4">
          {["Converted", "Dumped"].map((s) => (
            <button
              key={s}
              disabled={isLoading || status === s}
              onClick={() => {
                updateStatus(s);
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => handleActionPress("Quotes & PDFs")}
          className="bg-purple-100 px-4 py-2 rounded flex items-center gap-2"
        >
          <FileText size={16} />
          Quotes & PDFs
        </button>

        <button
          onClick={() => handleActionPress("Invoices")}
          className="bg-blue-100 px-4 py-2 rounded flex items-center gap-2"
        >
          <Receipt size={16} />
          Invoices
        </button>
      </div>

      {/* Notes */}
      <button
        onClick={() => setIsEditingNotes(!isEditingNotes)}
        className="flex justify-between w-full bg-gray-50 p-2 rounded mb-2"
      >
        <span>{isEditingNotes ? "Hide Notes" : "Add / View Notes"}</span>
        {isEditingNotes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isEditingNotes && (
        <div className="bg-gray-50 p-3 rounded">
          <textarea
            className="w-full border rounded p-2 min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditingNotes(false)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => window.alert("Notes saved")}
              className="px-3 py-1 bg-purple-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow mb-4 overflow-hidden w-full">
      <div
        className="flex transition-transform duration-300 w-full"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
      >
        <div className="w-full flex-shrink-0 p-4">
          {renderPage1()}
        </div>
        <div className="w-full flex-shrink-0 p-4">
          {renderPage2()}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 py-2">
        {pages.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${
              currentPage === i ? "bg-purple-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>


      <InvoiceListModal
        visible={isInvoiceModalVisible}
        onClose={() => setIsInvoiceModalVisible(false)}
        data={data}
        onCreateNew={handleCreateNewInvoice}
      />
      <QuotationListModal
        visible={isQuotationModalVisible}
        onClose={() => setIsQuotationModalVisible(false)}
        tripId={data?.TripId}
        data={data}
      />
    </div>
  );
};

export default FollowUpCards;
