import { useState, useCallback } from 'react';
import axios from "axios";

const useStatusChange = (initialStatus, quotationData) => {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  
  const sendHandoverEmail = useCallback(async (quotation) => {
    if (!quotation) {
      return;
    }

    try {
      const response = await axios.post(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/handovermail-manager",
        {
          TripId: quotation?.TripId,
          QuoteId: quotation?.LatestQuotationId,
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
      const isConfirmed = window.confirm(`Are you sure you want to change status to ${newStatus}?`);
      
      if (!isConfirmed) return;

      try {
        setIsLoading(true);
        const res = await axios.put(
          "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote",
          {
            TripId: quotationData?.TripId,
            LeadId: quotationData?.LeadId,
            LatestStatus: newStatus,
            SalesStatus: newStatus,
          }
        );

        setStatus(newStatus);
        
        if (newStatus === "Converted") {
          try {
            console.log('handover runs');
            await sendHandoverEmail(quotationData);
            window.alert("Success: Status Converted & handover email sent ✅");
          } catch (emailError) {
            window.alert("Status Updated: Converted ho gaya, but handover email fail ho gaya.");
          }
        } else {
          window.alert(`Success: Status updated to ${newStatus}`);
        }
      } catch (error) {
        console.error("Status update error:", error);
        window.alert("Error: Failed to update status. Please try again.");
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
