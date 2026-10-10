import { useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Calendar,
  CheckCircle,
  TrendingUp,
  Award,
  Star,
  Eye,
  Share2,
  FileText,
} from "lucide-react";
import { FetchQuoteByTripID } from "../../api/leads/FetchLeads";
import QuoteDetailsModal from "../modals/QuoteDetailsModal";
import InvoiceListModal from "../modals/InvoiceListModal";
import { toast } from "react-toastify";

const ConvertedCards = ({ data, onStatusChange }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);


  const fetchLatestQuote = async () => {
    if (!data?.TripId || isLoading) return;

    setIsLoading(true);
    try {
      const response = await FetchQuoteByTripID(data.TripId);
      if (Array.isArray(response?.data) && response.data.length > 0) {
        setQuoteDetails(response?.data.find((ele) => ele.QuoteId === data?.latestQuotationId));
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

  const handleCreateNewInvoice = () => {
    navigate("/invoices/create", {
      state: {
        initialData: data,
        tripId: data?.TripId,
      },
    });
    setIsInvoiceModalVisible(false);
  };

  const handleAction = (action) => {
    switch (action) {
      case 'view-quote':
        fetchLatestQuote();
        break;
      case 'download-invoice':
      case 'invoices':
        setIsInvoiceModalVisible(true);
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

          <h3 className="font-bold text-xl text-gray-900 mb-2 flex items-center gap-2">
            {data.clientName || data["Client-Name"]}

          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1 group">
              <Phone size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              <a href={`tel:${data.clientContact || data["Client-Contact"]}`} className="hover:text-emerald-600 transition-colors font-medium">
                {data.clientContact || data["Client-Contact"] || "No contact"}
              </a>
            </span>
            <span className="truncate max-w-xs">
              {data.clientEmail || data["Client-Email"]}
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


      </div>
      <div className="flex items-center justify-between">

        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200 ">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600 font-medium">From</p>
                  <p className="font-bold text-gray-900">{data.departureCity || data["Client-DepartureCity"] || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-emerald-400">
                <ChevronRight size={16} />
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600 font-medium">To</p>
                  <p className="font-bold text-gray-900">{data.destination || data["Client-Destination"] || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-3 py-2 rounded-full flex items-center gap-1.5 font-medium shadow-md">
              <Calendar size={12} />
              {new Date(data.travelDate || data["Client-TravelDate"]).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
          <button
            onClick={() => handleAction('view-quote')}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-3 rounded-xl flex items-center h-[3rem] justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Eye size={18} />
            <span className="font-medium">View Quote</span>
          </button>

          <button
            onClick={() => setIsInvoiceModalVisible(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl flex items-center h-[3rem] justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FileText size={18} />
            <span className="font-medium">Invoice</span>
          </button>


        </div>
      </div>
      {/* Route Information */}


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

        >
          <div className="w-full flex-shrink-0 p-6">
            {renderOverviewPage()}
          </div>

        </div>




      </div>

      {/* QUOTE DETAILS MODAL */}
      <QuoteDetailsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        quote={{ ...quoteDetails, ...data }}
      />
      <InvoiceListModal
        visible={isInvoiceModalVisible}
        onClose={() => setIsInvoiceModalVisible(false)}
        data={data}
        onCreateNew={handleCreateNewInvoice}
      />
    </>
  );
};

export default ConvertedCards;
