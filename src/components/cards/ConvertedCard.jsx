import { useRef, useState } from "react";
import {
  User,
  Phone,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { FetchQuoteByTripID } from "../../api/leads/FetchLeads";
import useStatusChange from "../../hooks/useStatusChange";
import QuoteDetailsModal from "../modals/QuoteDetailsModal";

const ConvertedCards = ({ data, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { status } = useStatusChange(
    data?.SalesStatus || "Converted",
    data
  );

  const cardWidth =
    typeof window !== "undefined"
      ? window.innerWidth - 32
      : 800;

  /* ------------------ FETCH LATEST QUOTE ------------------ */
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

  /* ------------------ CALL & WHATSAPP ------------------ */
  const handleCall = (phone) => {
    if (!phone) return window.alert("Phone number not available");
    window.open(`tel:${phone}`);
  };

  const handleWhatsApp = (phone) => {
    if (!phone) return window.alert("Phone number not available");
    const clean = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
        <div className="p-4">
          {/* CUSTOMER INFO */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-2">
                <User size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">
                  Trip #{data?.TripId}
                </p>
                <p className="text-gray-900 font-medium">
                  {data["Client-Name"]}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCall(data["Client-Contact"])}
                className="bg-gray-100 p-2 rounded-full"
              >
                <Phone size={16} className="text-gray-600" />
              </button>

              <button
                onClick={() => handleWhatsApp(data["Client-Contact"])}
                className="bg-gray-100 p-2 rounded-full"
              >
                <MessageCircle size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* EMAIL & CONTACT */}
          <div className="flex justify-between mb-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p className="text-gray-900">
                {data["Client-Email"] || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Contact</p>
              <p className="text-gray-900">
                {data["Client-Contact"] || "N/A"}
              </p>
            </div>
          </div>

          {/* DESTINATION & DATE */}
          <div className="flex justify-between mb-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Destination</p>
              <p className="text-gray-900">
                {data["Client-Destination"] || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Travel Date</p>
              <p className="text-gray-900">
                {data["Client-TravelDate"] || "N/A"}
              </p>
            </div>
          </div>

          {/* PAX / BUDGET / STATUS */}
          <div className="flex justify-between items-center mb-2 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Pax</p>
              <p className="text-gray-900">
                {data["Client-Pax"] || 0}A{" "}
                {data["Client-Child"] || 0}C
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">Budget</p>
              <p className="text-gray-900">
                {data["Client-Budget"]
                  ? `₹${Number(
                      data["Client-Budget"]
                    ).toLocaleString()}`
                  : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">Status</p>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* VIEW QUOTE */}
        <button
          disabled={isLoading}
          onClick={fetchLatestQuote}
          className="w-full flex items-center justify-center gap-2 py-3 border-t border-gray-100 text-purple-600 font-medium hover:bg-gray-50"
        >
          {isLoading ? "Loading..." : "View Quote Details"}
          <ChevronRight size={16} />
        </button>
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
