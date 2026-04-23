import React, { useState, useMemo } from "react";
import {
  Phone,
  ChevronDown,
  ChevronUp,
  FileText,
  Receipt,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  DollarSign,
  Save,
  X,
  Loader2,
  MapPin,
  ArrowRight,
  Mail,
} from "lucide-react";
import QuotationListModal from "../modals/QuotationListModal";
import InvoiceListModal from "../modals/InvoiceListModal";
import { useNavigate } from "react-router-dom";
import useStatusChange from "../../hooks/useStatusChange";

const FollowUpCards = ({ data }) => {
  const [notes, setNotes] = useState(
    data?.comments?.[0]?.Message || ""
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [isQuotationModalVisible, setIsQuotationModalVisible] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const { status, isLoading, updateStatus } = useStatusChange(
    data?.latestStatus || "New",
    data
  );

  const navigate = useNavigate();
  
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
    await new Promise((resolve) => setTimeout(resolve, 800));
    setHasUnsavedChanges(false);
    setIsSavingNotes(false);
    setIsEditingNotes(false);
  };

  const handleNotesChange = (value) => {
    setNotes(value);
    setHasUnsavedChanges(true);
  };

  const handleActionPress = (action) => {
    if (action === "Invoices") setIsInvoiceModalVisible(true);
    else if (action === "Quotes & PDFs") setIsQuotationModalVisible(true);
  };

  const travelDate = useMemo(() => {
    if (!data.travelDate) return "N/A";
    return new Date(data.travelDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [data.travelDate]);

  const totalGuests = (data.pax || 0) + (data.child || 0) + (data.infant || 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 w-full overflow-hidden flex flex-col group">
      {/* Top Section: Header & Status */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-purple-50 text-purple-700 text-[10px] sm:text-xs px-2.5 py-1 rounded-lg font-bold border border-purple-100 uppercase tracking-tight">
              Trip #{data.TripId || data?.QuoteId?.slice(0, 6)}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all border ${
                  status === "Converted"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                    : status === "Dumped"
                    ? "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                    : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                }`}
              >
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : status === "Converted" ? (
                  <CheckCircle size={12} />
                ) : status === "Dumped" ? (
                  <XCircle size={12} />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
                {status}
                <ChevronDown size={12} className={`transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1">
                  {["Converted", "Dumped"].map((s) => (
                    <button
                      key={s}
                      disabled={isLoading || status === s}
                      onClick={() => {
                        updateStatus(s);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        status === s ? "bg-gray-50 opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {s === "Converted" && <CheckCircle size={14} className="text-emerald-500" />}
                      {s === "Dumped" && <XCircle size={14} className="text-rose-500" />}
                      <span className="text-sm font-medium text-gray-700">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleActionPress("Quotes & PDFs")}
              className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all shadow-sm border border-purple-100"
              title="Quotes & PDFs"
            >
              <FileText size={18} />
            </button>
            <button 
              onClick={() => handleActionPress("Invoices")}
              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all shadow-sm border border-blue-100"
              title="Invoices"
            >
              <Receipt size={18} />
            </button>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 truncate leading-tight group-hover:text-purple-700 transition-colors">
            {data.clientName}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 font-medium">
            <a href={`tel:${data.clientContact}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
              <Phone size={14} className="text-gray-400" />
              {data.clientContact || "N/A"}
            </a>
            <div className="flex items-center gap-1.5 truncate max-w-[180px]">
              <Mail size={14} className="text-gray-400" />
              {data.clientEmail || "No Email"}
            </div>
          </div>
        </div>

        {/* Route and Meta Info Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          {/* Route Section */}
          <div className="flex-1 flex items-center bg-gray-50/80 rounded-xl p-2.5 border border-gray-100 gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">From</p>
              <p className="text-xs font-bold text-gray-800 truncate">{data.departureCity || "N/A"}</p>
            </div>
            <ArrowRight size={14} className="text-purple-300 shrink-0" />
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">To</p>
              <p className="text-xs font-bold text-gray-800 truncate">{data.destination || "N/A"}</p>
            </div>
          </div>

          {/* Meta Info Section */}
          <div className="flex-1 grid grid-cols-2 gap-4 items-center bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <Calendar size={14} className="text-purple-400" />
                <span>{travelDate}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <Users size={14} className="text-purple-400" />
                <span className="truncate">{totalGuests} Guests</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Budget</p>
              <p className="text-lg font-black text-purple-600 flex items-center justify-end">
                <DollarSign size={15} strokeWidth={3} className="text-purple-500 mr-0.5" />
                {data.budget?.toLocaleString("en-IN") || "0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Notes collapsed */}
      <div className="mt-auto border-t border-gray-50">
        <button 
          onClick={() => setIsEditingNotes(!isEditingNotes)}
          className={`w-full px-5 py-3 flex items-center justify-between text-sm font-semibold transition-colors duration-200 ${
            isEditingNotes ? 'bg-gray-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className={isEditingNotes ? "text-purple-500" : "text-gray-400"} />
            <span>Notes & Comments</span>
            {hasUnsavedChanges && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-1" />}
          </div>
          {isEditingNotes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isEditingNotes && (
          <div className="p-4 bg-gray-50 space-y-3 animate-in slide-in-from-top-2">
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add internal notes for this trip..."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all resize-none shadow-inner"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsEditingNotes(false)}
                className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNotes}
                disabled={isSavingNotes || !hasUnsavedChanges}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
              >
                {isSavingNotes ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save Changes
              </button>
            </div>
          </div>
        )}
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
