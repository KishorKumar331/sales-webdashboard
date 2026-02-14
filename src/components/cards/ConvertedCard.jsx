import { useRef, useState, useMemo } from "react";
import {
  User,
  Phone,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Award,
  Star,
  FileText,
  Receipt,
  Eye,
  Download,
  Share2,
  Loader2,
} from "lucide-react";
import { FetchQuoteByTripID } from "../../api/leads/FetchLeads";
import useStatusChange from "../../hooks/useStatusChange";
import QuoteDetailsModal from "../modals/QuoteDetailsModal";

const ConvertedCards = ({ data, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);

  const { status } = useStatusChange(
    data?.SalesStatus || "Converted",
    data
  );

  const pages = useMemo(() => ["overview", "details"], []);

  const fetchLatestQuote = async () => {
    if (!data?.TripId || isLoading) return;

    setIsLoading(true);
    try {
      const response = await FetchQuoteByTripID(data.TripId);

      if (Array.isArray(response?.data) && response.data.length > 0) {
        setQuoteDetails(response.data[0]);
        setIsModalVisible(true);
      } else {
        window.alert("No quotes found for this trip.");
      }
    } catch (err) {
      console.error("Error fetching quote:", err);
      window.alert("Failed to fetch quote details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone) => {
    if (!phone) return window.alert("Phone number not available");
    window.open(`tel:${phone}`);
  };

  const handleWhatsApp = (phone) => {
    if (!phone) return window.alert("Phone number not available");
    const clean = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  const handleAction = (action) => {
    switch(action) {
      case 'view-quote':
        fetchLatestQuote();
        break;
      case 'download-invoice':
        window.alert('Download invoice functionality would be implemented here');
        break;
      case 'share-details':
        window.alert('Share functionality would be implemented here');
        break;
      default:
        window.alert(action);
    }
  };

  const renderOverviewPage = () => (
    <div>
      {/* Header with Conversion Success */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm flex items-center gap-1">
              <CheckCircle size={10} />
              Converted
            </span>
            <div className="flex items-center gap-1 text-emerald-600">
              <Star size={12} className="fill-current" />
              <span className="text-xs font-medium">Success</span>
            </div>
          </div>

          <h3 className="font-bold text-xl text-gray-900 mb-2 flex items-center gap-2">
            {data["Client-Name"]}
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
              <Award size={10} />
              VIP
            </div>
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1 group">
              <Phone size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              <a href={`tel:${data["Client-Contact"]}`} className="hover:text-emerald-600 transition-colors font-medium">
                {data["Client-Contact"] || "No contact"}
              </a>
            </span>
            <span className="truncate max-w-xs">
              {data["Client-Email"]}
            </span>
          </div>

          {/* Conversion Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp size={12} />
              <span className="font-medium">Conversion Rate: 100%</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600">
              <Calendar size={12} />
              <span className="font-medium">
                Converted {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage(1)}
          className="bg-gradient-to-r from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200 p-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <ChevronRight size={20} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Route Information */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              <div>
                <p className="text-xs text-gray-600 font-medium">From</p>
                <p className="font-bold text-gray-900">{data["Client-DepartureCity"] || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-emerald-400">
              <ChevronRight size={16} />
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              <div>
                <p className="text-xs text-gray-600 font-medium">To</p>
                <p className="font-bold text-gray-900">{data["Client-Destination"] || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-3 py-2 rounded-full flex items-center gap-1.5 font-medium shadow-md">
            <Calendar size={12} />
            {new Date(data["Client-TravelDate"]).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Revenue & Passengers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">Revenue Generated</p>
              <p className="text-2xl font-bold">
                ₹{data["Client-Budget"]?.toLocaleString('en-IN') || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">Total Passengers</p>
              <div className="flex gap-3 items-baseline">
                <p className="text-2xl font-bold">
                  {(parseInt(data["Client-Pax"]) || 0) + (parseInt(data["Client-Child"]) || 0)}
                </p>
                <p className="text-xs text-white/70">
                  {data["Client-Pax"] || 0}A • {data["Client-Child"] || 0}C
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsPage = () => (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm">
            Trip #{data.TripId}
          </span>
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Award size={12} />
            Converted Successfully
          </div>
        </div>

        <button
          onClick={() => setCurrentPage(0)}
          className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 p-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <ChevronLeft size={18} className="text-gray-600 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => handleAction('view-quote')}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Eye size={18} />
          <span className="font-medium">View Quote</span>
        </button>

        <button
          onClick={() => handleAction('download-invoice')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Download size={18} />
          <span className="font-medium">Invoice</span>
        </button>

        <button
          onClick={() => handleAction('share-details')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Share2 size={18} />
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User size={16} className="text-gray-600" />
            Client Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Email Address</p>
              <p className="text-sm text-gray-900 font-medium">{data["Client-Email"] || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Phone Number</p>
              <p className="text-sm text-gray-900 font-medium">{data["Client-Contact"] || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Destination</p>
              <p className="text-sm text-gray-900 font-medium">{data["Client-Destination"] || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Travel Date</p>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(data["Client-TravelDate"]).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Contact Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleCall(data["Client-Contact"])}
          className="flex-1 bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border border-emerald-200 font-medium"
        >
          <Phone size={18} />
          Call Client
        </button>

        <button
          onClick={() => handleWhatsApp(data["Client-Contact"])}
          className="flex-1 bg-gradient-to-r from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border border-emerald-200 font-medium"
        >
          <MessageCircle size={18} />
          WhatsApp
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-full border border-gray-100 group relative">
        {/* Success Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
            <CheckCircle size={12} />
            Converted
          </div>
        </div>

        <div
          className="flex transition-all duration-500 ease-in-out w-full"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          <div className="w-full flex-shrink-0 p-6">
            {renderOverviewPage()}
          </div>
          <div className="w-full flex-shrink-0 p-6">
            {renderDetailsPage()}
          </div>
        </div>

        {/* Enhanced Navigation Dots */}
        <div className="flex justify-center items-center gap-3 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-100">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`transition-all duration-300 ${
                currentPage === i
                  ? "w-8 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
                  : "w-2 h-2 bg-gray-300 hover:bg-emerald-400 rounded-full"
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
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage === pages.length - 1}
            className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 pointer-events-auto transition-all duration-200 hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* QUOTE DETAILS MODAL */}
      <QuoteDetailsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        quote={{ ...quoteDetails, ...data }}
      />
    </>
  );
};

export default ConvertedCards;
