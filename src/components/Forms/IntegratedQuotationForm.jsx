

import React, { useMemo, useState } from "react";
import { FormProvider } from "react-hook-form";
import BasicDetails from "./BasicDetails";
import CostCalculator from "./CostCalculator";
import { Loader2 } from "lucide-react";

import { clearQuotationDraft } from "../../storage/quotationDraft";
import HotelsSection from "./HotelSection";
import InclusionsExclusions from "./InclusionsExclusions";
import FlightSection from "./FlightsSection";
import ItinerarySection from "./ItinearySection";
import { useQuotationDraft } from "../../hooks/useQuoatationDraft";

const calculateTravelEndDate = (startDate, days) => {
  if (!startDate || !days) return "";
  const start = new Date(startDate);
  const end = new Date(start.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
  return end.toISOString().split("T")[0];
};

const IntegratedQuotationForm = ({ onSubmit, initialData = {}, lead, followUpData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tripId = followUpData?.TripId || lead?.TripId || "";
  const userData = {
    CompanyId: "12345",
    AssignDate: new Date().toISOString(),
    AssignDateKey: +new Date().toISOString().slice(0, 10).replace(/-/g, ""),
  };

  // ------------------ Normalize both structures -------------------
  const sourceData = followUpData || lead;
  const client = followUpData
    ? {
        FullName: followUpData["Client-Name"],
        Contact: followUpData["Client-Contact"],
        Email: followUpData["Client-Email"],
        TravelDate: followUpData.TravelDate,
        Pax: followUpData.NoOfPax,
        Child: followUpData.Child,
        Infant: followUpData.Infant,
        Budget: followUpData.Budget,
        DepartureCity: followUpData.DepartureCity,
        DestinationName: followUpData.DestinationName,
        Destinations: followUpData.Destinations || [followUpData.DestinationName],
        Days: followUpData.Days,
        IsMultiDestination: followUpData.IsMultiDestination,
      }
    : sourceData?.ClientLeadDetails || {};

  // ------------------ Default form values -------------------
  const defaults = useMemo(
    () => ({
      LeadId: sourceData?.LeadId,
      TripId: sourceData?.TripId || "",
      "Client-Name": client?.FullName || "",
      "Client-Contact": client?.Contact || "",
      "Client-Email": client?.Email || "",
      TravelDate: client?.TravelDate || "",
      TravelDateKey: client?.TravelDate
        ? +new Date(client.TravelDate).toISOString().slice(0, 10).replace(/-/g, "")
        : null,
      AssignDate: sourceData?.AssignDate || new Date().toISOString(),
      NoOfPax: client?.Pax || "",
      Child: client?.Child || "0",
      Infant: client?.Infant || "0",
      Budget: client?.Budget || "",
      DepartureCity: client?.DepartureCity || "",
      DestinationName: client?.DestinationName || "",
      IsMultiDestination: client?.IsMultiDestination || false,
      Destinations:
        client?.Destinations || (client?.DestinationName ? [client.DestinationName] : []),
      Days: client?.Days || 2,
      Nights: client?.Days ? client.Days - 1 : 1,
      PriceType: followUpData?.PriceType || "Total",
      Currency: followUpData?.Currency || "INR",
      Costs: followUpData?.Costs || {
        LandPackageCost: 0,
        VisaCost: 0,
        FlightCost: 0,
        GSTAmount: 0,
        TCSAmount: 0,
        TotalCost: 0,
        TotalTax: 0,
      },
      GST: followUpData?.GST || { Enabled: true, WaivedOffAmount: 0, WaivedOffOtps: [] },
      TCS: followUpData?.TCS || { Enabled: true, WaivedOffAmount: 0, WaivedOffOtps: [] },
      Images: followUpData?.Images || { Inclusions: [], Flights: [] },
      Hotels: followUpData?.Hotels || [
        {
          Nights: 0,
          Name: "",
          City: "",
          RoomType: "",
          Category: 0,
          Meals: [],
          CheckInDate: "",
          CheckInDateKey: null,
          CheckOutDate: "",
          CheckOutDateKey: null,
          Comments: "",
        },
      ], 

      Inclusions: followUpData?.Inclusions || [],
      Exclusions: followUpData?.Exclusions || [],
      Itinearies: followUpData?.Itinearies || [
        {
          Date: "",
          DateKey: null,
          Title: "",
          Activities: "",
          ImageUrl: "",
          Description: "",
        },
      ],
      CreatedAt: new Date().toISOString(),
      LastUpdateStatus: {
        UpdatedBy: "Draft",
        UpdatedTime: new Date().toISOString(),
      },
      TravelEndDate: calculateTravelEndDate(client?.TravelDate, Number(client?.Days)),
      TravelEndDateKey: client?.TravelDate
        ? +new Date(client.TravelDate).toISOString().slice(0, 10).replace(/-/g, "")
        : null,
      ...initialData,
    }),
    [followUpData?.QuoteId, lead?.TripId, tripId, initialData]
  );

  // ------------------ Hook for autosave draft -------------------
  // Skip loading cached draft when opening existing quotation (followUpData exists)
  // Pass QuoteId as uniqueId to track when quotation changes
  const { methods, loading } = useQuotationDraft(
    tripId, 
    defaults, 
    !!followUpData,
    followUpData?.QuoteId
  );

  const sections = useMemo(
    () => [
      { key: "basic", Component: BasicDetails },
      { key: "cost", Component: CostCalculator },
      { key: "hotels", Component: HotelsSection },
      { key: "incl-excl", Component: InclusionsExclusions },
      { key: "flights", Component: FlightSection },
      { key: "itinerary", Component: ItinerarySection },
    ],
    []
  );

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      console.log("Form Submit Data:", data);
      await onSubmit({ ...data, ...userData });
      await clearQuotationDraft(tripId);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <FormProvider {...methods}>
      <div style={{ padding: '20px' }}>
        {sections.map(({ key, Component }) => (
          <div key={key} style={{ marginBottom: '30px' }}>
            <Component />
          </div>
        ))}
      <div className="flex justify-center">
          <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? '#9ca3af' : '#7c3aed',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isSubmitting ? 0.8 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit</span>
          )}
        </button>
      </div>
      </div>
    </FormProvider>
  );
};

export default IntegratedQuotationForm;
