import React, { useState, useMemo } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  Send,
  MoreVertical,
  Calendar,
  Users,
  Moon,
  Wallet,
  FilePlus,
  FileText,
  ArrowRight,
  Flame,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import QuotationListModal from "../modals/QuotationListModal";
import InvoiceListModal from "../modals/InvoiceListModal";
import { useNavigate } from "react-router-dom";
import useStatusChange from "../../hooks/useStatusChange";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

const FollowUpCards = ({ data }) => {
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [isQuotationModalVisible, setIsQuotationModalVisible] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [notes, setNotes] = useState(data?.salesComment || data?.comments?.[0]?.Message || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { status, isLoading, updateStatus } = useStatusChange(
    data?.latestStatus || "New",
    data
  );

  const { user } = useAuth();
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
    if (!notes.trim()) return;

    setIsSavingNotes(true);
    try {

      await axios.put(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote",
        {
          company: user?.organization?.company || data?.company,
          CreatedAt: data?.CreatedAt,
          TripId: data?.TripId,
          LeadId: data?.LeadId,
          salesComment: notes,
        }
      );

      toast.success("Note saved successfully! ✅");

      // Update local data
      data.salesComment = notes;

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Save note error:", error);
      toast.error("Failed to save note. Please try again.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleActionPress = (action) => {
    if (action === "Invoices") setIsInvoiceModalVisible(true);
    else if (action === "Quotes & PDFs") setIsQuotationModalVisible(true);
  };

  const initials = useMemo(() => {
    if (!data.clientName) return "??";
    return data.clientName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [data.clientName]);

  const travelDate = useMemo(() => {
    if (!data.travelDate) return { date: "N/A", mon: "" };
    const dateObj = new Date(data.travelDate);
    return {
      date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      mon: dateObj.toLocaleDateString("en-US", { weekday: "short" })
    };
  }, [data.travelDate]);

  const guestSummary = useMemo(() => {
    const adults = data.pax || 0;
    const kids = (data.child || 0) + (data.infant || 0);
    return {
      total: adults + kids,
      adults: adults,
      kids: kids
    };
  }, [data.pax, data.child, data.infant]);

  return (
    <div className="bg-white mx-auto rounded-4xl p-6 shadow-sm border border-gray-50 flex flex-col gap-6 w-full hover:shadow-md transition-shadow duration-300">
      {/* Top Header Section */}
      <div className="flex items-start justify-between relative">
        <div className="flex gap-4">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#F3F0FF] flex items-center justify-center text-[#7C3AED] font-bold text-xl">
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#4ADE80] border-2 border-white"></div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#FEF2F2] text-[#EF4444] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Flame size={12} fill="currentColor" />
                HOT LEAD
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex items-center gap-1.5 bg-[#F5F3FF] text-[#7C3AED] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#EDE9FE] transition-colors"
                >
                  TRIP #{data.TripId || "K60LTU5"}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in slide-in-from-top-1">
                    {["Converted", "Dumped", "InProgress"].map((s) => (
                      <button
                        key={s}
                        disabled={isLoading || status === s}
                        onClick={() => {
                          updateStatus(s);
                          setIsStatusDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs font-semibold text-gray-700"
                      >
                        {s === "Converted" ? (
                          <CheckCircle size={14} className="text-[#10B981]" />
                        ) : s === "InProgress" ? (
                          <Loader2 size={14} className="text-[#7C3AED] animate-spin" />
                        ) : (
                          <XCircle size={14} className="text-[#EF4444]" />
                        )}
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-1">
              <h3 className="text-xl font-extrabold text-[#111827]">{data.clientName}</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
                  <Phone size={14} fill="#9CA3AF" color="#9CA3AF" />
                  <span className="font-semibold text-gray-600">{data.clientContact}</span>
                </div>
                <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
                  <Mail size={14} />
                  <span className="font-semibold text-gray-600">{data.clientEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Social Icons */}
          <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
            <MessageCircle size={20} color="#22C55E" className="cursor-pointer hover:scale-110 transition-transform" fill="#22C55E" fillOpacity={0.1} />
            <Phone size={20} color="#8B5CF6" className="cursor-pointer hover:scale-110 transition-transform" fill="#8B5CF6" fillOpacity={0.1} />
            <Mail size={20} color="#3B82F6" className="cursor-pointer hover:scale-110 transition-transform" fill="#3B82F6" fillOpacity={0.1} />
            <Send size={20} color="#F59E0B" className="cursor-pointer hover:scale-110 transition-transform" fill="#F59E0B" fillOpacity={0.1} />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleActionPress("Quotes & PDFs")}
              className="flex items-center gap-2 border border-[#EBE9FE] text-[#7C3AED] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#F5F3FF] transition-all"
            >
              <FilePlus size={16} />
              Quote More
            </button>
            <button
              onClick={() => handleActionPress("Invoices")}
              className="flex items-center gap-2 border border-[#E0F2FE] text-[#0284C7] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#F0F9FF] transition-all"
            >
              <FileText size={16} />
              Invoice
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Grid Section */}
      <div className="border border-[#F3F4F6] rounded-2xl p-4 flex items-center justify-between gap-6 overflow-x-auto no-scrollbar">
        {/* FROM */}
        <div className="flex items-center gap-3 min-w-[140px]">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED]">
            <MapPin size={20} fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">From</p>
            <p className="text-sm font-extrabold text-[#1F2937] leading-tight">{data.departureCity || "N/A"}</p>
            <p className="text-[10px] font-medium text-[#9CA3AF]">India</p>
          </div>
        </div>

        <ArrowRight className="text-[#E5E7EB]" size={16} />

        {/* TO */}
        <div className="flex items-center gap-3 min-w-[140px]">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED]">
            <MapPin size={20} fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">To</p>
            <p className="text-sm font-extrabold text-[#1F2937] leading-tight">{data.destination || "N/A"}</p>
            <p className="text-[10px] font-medium text-[#9CA3AF]">UAE</p>
          </div>
        </div>

        <div className="w-px h-10 bg-[#F3F4F6]"></div>

        {/* DEPARTURE */}
        <div className="flex items-center gap-3 min-w-37.5">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED]">
            <Calendar size={20} fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Departure</p>
            <p className="text-sm font-extrabold text-[#1F2937] leading-tight">{travelDate.date}</p>
            <p className="text-[10px] font-medium text-[#9CA3AF]">{travelDate.mon}</p>
          </div>
        </div>

        {/* GUESTS */}
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED]">
            <Users size={20} fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Guests</p>
            <p className="text-sm font-extrabold text-[#1F2937] leading-tight">{guestSummary.total} Guests</p>
            <p className="text-[10px] font-medium text-[#9CA3AF]">{guestSummary.adults} Adults</p>
          </div>
        </div>

        {/* DURATION */}
        <div className="flex items-center gap-3 min-w-25">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED]">
            <Moon size={20} fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Duration</p>
            <p className="text-sm font-extrabold text-[#1F2937] leading-tight">{data.nights || "0"} Nights</p>
            <p className="text-[10px] font-medium text-[#9CA3AF]">{data.days || "1"} Days</p>
          </div>
        </div>

        {/* BUDGET */}
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED]">
            <Wallet size={20} fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Budget</p>
            <p className="text-sm font-extrabold text-[#1F2937] leading-tight">₹{data.budget?.toLocaleString("en-IN") || "0"}</p>
            <p className="text-[10px] font-medium text-[#9CA3AF]">Total Budget</p>
          </div>
        </div>
      </div>

      {/* Footer Notes Section (Accordion) */}
      <div className="flex flex-col">
        <button
          onClick={() => setIsNotesExpanded(!isNotesExpanded)}
          className="bg-[#FFFBEB]/50 border border-[#FEF3C7] rounded-2xl p-4 flex items-center justify-between hover:bg-[#FFFBEB] transition-all group/notes"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] group-hover/notes:scale-110 transition-transform">
              <FileText size={20} fill="currentColor" fillOpacity={0.2} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#92400E]">Notes</p>
              <p className="text-sm text-[#B45309] font-medium truncate max-w-125">
                {data?.comments?.[0]?.Message || "No notes available."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F3F4F6] text-[#4B5563] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#E5E7EB] transition-all">
            {isNotesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isNotesExpanded ? "Hide Details" : "View All Notes"}
          </div>
        </button>

        {isNotesExpanded && (
          <div className="mt-2 p-5 bg-white border border-[#FEF3C7] rounded-3xl shadow-lg animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-[#92400E] uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} />
                Edit Internal Note
              </h4>
            </div>

            <div className="relative group/input">
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Type your internal note here..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm min-h-32 focus:ring-2 focus:ring-[#FEF3C7] focus:border-[#FEF3C7] focus:bg-white outline-none transition-all resize-none font-medium text-gray-700 shadow-inner"
              />

              <div className={`flex justify-end gap-2 mt-3 transition-opacity duration-300 ${hasUnsavedChanges ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <button
                  onClick={() => {
                    setNotes(data?.salesComment || "");
                    setHasUnsavedChanges(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || !hasUnsavedChanges}
                  className="bg-[#D97706] text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-[#B45309] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSavingNotes ? <Loader2 size={12} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
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
