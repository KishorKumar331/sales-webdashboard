import React, { useState, useRef, useMemo, useEffect } from "react";
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
  Clock,
  MapPin,
  Users,
  DollarSign,
  Save,
  X,
  Loader2,
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
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
const navigate=useNavigate()
  const handleCreateNewInvoice = () => {
  navigate("/invoices/create", {
      state: {
        initialData: data,
        tripId: data.TripId,
      },
    });
    setIsInvoiceModalVisible(false);
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasUnsavedChanges(false);
    setIsSavingNotes(false);
    setIsEditingNotes(false);
  };

  const handleNotesChange = (value) => {
    setNotes(value);
    setHasUnsavedChanges(true);
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
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm">
              Trip #{data.TripId || data?.QuoteId?.slice(0, 6)}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Clock size={12} />
              <span className="text-xs">Active</span>
            </div>
          </div>

          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {data["Client-Name"]}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Phone size={14} className="text-green-600" />
              <a href={`tel:${data["Client-Contact"]}`} className="hover:text-green-600 transition-colors">
                {data["Client-Contact"] || "No contact"}
              </a>
            </span>
            <span className="truncate max-w-xs">
              {data["Client-Email"]}
            </span>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage(1)}
          className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <ChevronRight size={18} className="text-purple-600 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
<div className="flex justify-between">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl  border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 font-medium">From</p>
                <p className="font-semibold text-gray-900">{data["Client-DepartureCity"] || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400 sm:hidden">
              <ChevronRight size={16} />
            </div>
            
            <div className="hidden sm:flex items-center gap-1 text-gray-400">
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <ChevronRight size={16} />
              <div className="w-8 h-0.5 bg-gray-300"></div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 font-medium">To</p>
                <p className="font-semibold text-gray-900">{data["Client-Destination"] || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs px-3 py-2 rounded-full flex items-center gap-1.5 font-medium border border-blue-200 w-full sm:w-auto justify-center">
            <Calendar size={12} />
            {new Date(data["Client-TravelDate"]).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Budget & Passengers */}
      <div className="flex h-[4.5rem] flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <DollarSign size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Budget</p>
            <p className="text-xl font-bold text-purple-600">
              ₹{data["Client-Budget"]?.toLocaleString('en-IN') || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Users size={16} className="text-gray-400" />
          <div className="flex gap-3 sm:gap-4 text-sm flex-1 sm:flex-none">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 font-medium">Adults</p>
              <p className="font-semibold text-gray-900">{data["Client-Adults"] || 0}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 font-medium">Children</p>
              <p className="font-semibold text-gray-900">{data["Client-Children"] || 0}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 font-medium">Infants</p>
              <p className="font-semibold text-gray-900">{data["Client-Infants"] || 0}</p>
            </div>
          </div>
        </div>
      </div>

</div>
      {/* Route */}
    </div>
  );

  const renderPage2 = () => (
    <div>
      {/* Status */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm">
            Trip #{data.TripId}
          </span>
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            status === "Converted" 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : status === "Dumped" 
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-gray-100 text-gray-700 border border-gray-200"
          }`}>
            {isLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : status === "Converted" ? (
              <CheckCircle size={12} />
            ) : status === "Dumped" ? (
              <XCircle size={12} />
            ) : (
              <Clock size={12} />
            )}
            {status}
          </div>
        </div>

        <div className="relative sm:w-auto w-full">
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-purple-300 px-4 py-2 rounded-xl flex items-center justify-center sm:justify-start gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="text-sm font-medium">Change Status</span>
            {isStatusDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isStatusDropdownOpen && (
            <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden">
              {["Converted", "Dumped"].map((s) => (
                <button
                  key={s}
                  disabled={isLoading || status === s}
                  onClick={() => {
                    updateStatus(s);
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${
                    status === s ? "bg-gray-50 cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  {s === "Converted" && <CheckCircle size={16} className="text-green-600" />}
                  {s === "Dumped" && <XCircle size={16} className="text-red-600" />}
                  <div>
                    <p className="font-medium text-sm">{s}</p>
                    <p className="text-xs text-gray-500">
                      {s === "Converted" ? "Mark as successful conversion" : "Mark as lost opportunity"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => handleActionPress("Quotes & PDFs")}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <FileText size={18} />
          <span className="font-medium">Quotes & PDFs</span>
        </button>

        <button
          onClick={() => handleActionPress("Invoices")}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Receipt size={18} />
          <span className="font-medium">Invoices</span>
        </button>
      </div>

      {/* Notes */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setIsEditingNotes(!isEditingNotes)}
          className="flex justify-between items-center w-full p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <FileText size={16} className="text-gray-600" />
            </div>
            <div className="text-left">
              <span className="font-medium text-gray-900">Notes</span>
              {hasUnsavedChanges && (
                <span className="ml-2 text-xs text-amber-600 font-medium">Unsaved changes</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            )}
            {isEditingNotes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {isEditingNotes && (
          <div className="p-4 bg-white border-t border-gray-200">
            <textarea
              className="w-full border-2 border-gray-200 rounded-xl p-3 min-h-[120px] focus:border-purple-300 focus:outline-none transition-colors resize-none"
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add your notes here..."
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">
                {notes.length} characters
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditingNotes(false);
                    setHasUnsavedChanges(false);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || !hasUnsavedChanges}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isSavingNotes ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Notes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-full border border-gray-100 group">
      <div
        className="flex transition-all duration-500 ease-in-out w-full"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
      >
        <div className="w-full flex-shrink-0 p-6">
          {renderPage1()}
        </div>
        <div className="w-full flex-shrink-0 p-6">
          {renderPage2()}
        </div>
      </div>

      {/* Enhanced Navigation Dots */}
      <div className="flex justify-center items-center gap-3 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`transition-all duration-300 ${
              currentPage === i
                ? "w-8 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400 rounded-full"
            }`}
          />
        ))}
      </div>

      {/* Page Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 pointer-events-auto transition-all duration-200 hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} className="rotate-180 text-gray-600" />
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
          className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 pointer-events-auto transition-all duration-200 hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Modals */}
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
