

import React, { useMemo } from "react";
import { FormProvider } from "react-hook-form";
import SimpleQuotationWrapper from "./SimpleQuotationWrapper";
import BasicDetails from "./BasicDetails";
import CostCalculator from "./CostCalculator";

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
  console.log("Lead Data:", lead);
  console.log("FollowUp Data:", followUpData);

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
    console.log("Form Submit Data:", data);
    await onSubmit({ ...data, ...userData });
    await clearQuotationDraft(tripId);
  });



  return (
    <FormProvider {...methods}>
      <SimpleQuotationWrapper
        sections={sections}
        onSubmit={handleSubmit}
        header={null}
        footer={null}
      />
    </FormProvider>
  );
};

export default IntegratedQuotationForm;
