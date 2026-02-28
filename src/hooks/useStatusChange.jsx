import { useState, useCallback } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

const useStatusChange = (initialStatus, quotationData) => {
  const {user}=useAuth();
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  
  const sendHandoverEmail = useCallback(async (quotation) => {
    console.log(quotation)
    debugger
    if (!quotation) {
      return;
    }

    try {
      const response = await axios.post(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/handovermail-manager",
        {
          TripId: quotation?.TripId,
          QuoteId: quotation?.latestQuotationId,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "🔥 Handover email error:",
        error?.response?.data || error?.message || error
      );
      throw error;
    }
  }, []);

  const updateStatus = useCallback(
    async (newStatus) => {
      const isConfirmed = toast(
        ({ closeToast }) => (
          <div>
            <p>Are you sure you want to change status to {newStatus}?</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  closeToast();
                  performStatusUpdate(newStatus);
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Yes
              </button>
              <button
                onClick={closeToast}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
              >
                No
              </button>
            </div>
          </div>
        ),
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        }
      );
    },
    [sendHandoverEmail, quotationData]
  );

  const performStatusUpdate = useCallback(
    async (newStatus) => {
      try {
        setIsLoading(true);
        const res = await axios.put(
          "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote",
          {
            company: user?.CompanyName,
            CreatedAt:quotationData?.CreatedAt,
            TripId: quotationData?.TripId,
            LeadId: quotationData?.LeadId,
            latestStatus: newStatus,
            // SalesStatus: newStatus,
          }
        );

        setStatus(newStatus);
        
        if (newStatus === "Converted") {
          try {
            console.log('handover runs');
            await sendHandoverEmail(quotationData);
            toast.success("Success: Status Converted & handover email sent ✅");
          } catch (emailError) {
            toast.error("Status Updated: Converted ho gaya, but handover email fail ho gaya.");
          }
        } else {
          toast.success(`Success: Status updated to ${newStatus}`);
        }
      } catch (error) {
        console.error("Status update error:", error);
        toast.error("Error: Failed to update status. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [sendHandoverEmail, quotationData]
  );

  return {
    status,
    isLoading,
    updateStatus,
  };
};

export default useStatusChange;
