import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import CalendarDatePicker from "../DatePicker";
import PdfPreviewModal from "../modals/PdfPreviewModal";
import CustomPicker from "../CustomPicker";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function InvoiceForm({
  tripId,
  onSubmit,
  initialData = null,
  tripData = null,
  isEdit = false,
  defaultCustomerName = "",
  defaultEmail = "",
  defaultContact = "",
  defaultDestination = "",
  defaultPax = "",
  defaultTravelDate = "",
}) {
  console.log(initialData);
  const [step, setStep] = useState("fillForm"); // 'selectQuotation' or 'fillForm'
  const [quotations, setQuotations] = useState([]);
  const [TripDetail, setTripDetail] = useState([]);
  console.log(TripDetail);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfUri, setPdfUri] = useState(null);
  const [pdfHtml, setPdfHtml] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formDataToSubmit, setFormDataToSubmit] = useState(null);
  const { user: userProfile } = useAuth();
  const [formData, setFormData] = useState({
    invoiceId: "",
    invoiceNumber: "",
    tripId: tripId || "",
    finalPackageQuotationId: "",
    leadId: "",
    createdAt: "",
    updatedAt: "",
    invoiceDate: "",
    invoiceStatus: "Pending",
    currency: "INR",
    customer: {
      name: "",
      email: "",
      contact: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
    },
    travelerSummary: {
      adults: 0,
      children: 0,
      infants: 0,
      totalTravelers: 0,
    },
    destination: "",
    travelDate: "",
    startDate: "",
    endDate: "",
    packageSummary: {
      packageName: "",
      packageType: "International",
      nights: 0,
      days: 0,
    },
    pricing: {
      baseAmount: 0,
      discountAmount: 0,
      taxableAmount: 0,
      gstPercentage: 0,
      gstAmount: 0,
      tcsPercentage: 0,
      tcsAmount: 0,
      otherCharges: [],
      totalAmount: 0,
      amountInWords: "",
      tcsClaim: Array.isArray(initialData?.pricing?.tcsClaim)
        ? initialData.pricing.tcsClaim
        : [{ panNumber: "", name: "", percentage: 0 }],
    },
    payment: {
      installments: [
        {
          sequence: 1,
          installmentAmount: 0,
          installmentDate: "",
          status: "Pending",
        },
      ],
    },
    cancellationPolicy: {
      flights: "As per airline policy",
      hotel: "As per the hotel policy",
      land: [
        {
          fromDaysBeforeTravel: 20,
          toDaysBeforeTravel: null,
          chargeType: "PERCENT",
          value: 25,
        },
        {
          fromDaysBeforeTravel: 0,
          toDaysBeforeTravel: 19,
          chargeType: "PERCENT",
          value: 100,
        },
      ],
      nonRefundableComponents: ["Visa", "TCS", "Taxes", "Remittance charges"],
      jrCancellationChargePerPax: 2500,
      rescheduleChargePerPax: {
        amount: 2000,
        notes: "Per pax + fare difference for flights and land part",
      },
      latePaymentFee: {
        amount: 5000,
        notes: "Within allowable limits",
      },
    },
    deliverables: [
      { item: "Hotel Vouchers", required: true, provided: false },
      { item: "Cab/Driver Details", required: true, provided: false },
      { item: "Scanned copy of passport", required: true, provided: false },
      {
        item: "Scanned copy of flights and tickets",
        required: true,
        provided: false,
      },
      {
        item: "Payment screenshot (esp. NEFT)",
        required: true,
        provided: false,
      },
      { item: "Scanned copy of PAN card", required: true, provided: false },
    ],
    notes: "",
    meta: {
      lastUpdatedBy: userProfile?.user?.Email,
      source: "website",
      companyProfileId: userProfile?.user?.company,
      companyName: userProfile?.organization?.details?.companyname,
      bankDetails: {},
    },
  });

  // Load quotations when TripId is available
  useEffect(() => {
    if (tripId) {
      setFormData((prev) => ({ ...prev, tripId }));
      fetchQuotations();
      fetchTrips();
    }
  }, [tripId]);

  // Apply initialData if passed (not used from screen currently, but kept)
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        invoiceId: initialData?.invoiceId || prev.invoiceId,
        companyEmail: userProfile?.user?.Email,
        invoiceNumber: initialData?.invoiceNumber || prev.invoiceNumber,
        tripId: initialData?.tripId || prev.tripId,
        finalPackageQuotationId:
          initialData?.finalPackageQuotationId || prev.finalPackageQuotationId,
        leadId: initialData?.LeadId || prev.leadId,
        createdAt: initialData?.createdAt || prev.createdAt,
        updatedAt: initialData?.updatedAt || prev.updatedAt,
        invoiceDate: initialData?.invoiceDate || prev.invoiceDate,
        invoiceStatus: initialData?.invoiceStatus || prev.invoiceStatus,
        customer: {
          ...prev.customer,
          name: initialData?.customer?.name || prev.customer.name,
          email: initialData?.customer?.email || prev.customer.email,
          contact: initialData?.customer?.contact || prev.customer.contact,
          address: {
            ...prev.customer.address,
            street:
              initialData?.customer?.address?.street ||
              prev.customer.address.street,
            city:
              initialData?.customer?.address?.city ||
              prev.customer.address.city,
            state:
              initialData?.customer?.address?.state ||
              prev.customer.address.state,
            zipCode:
              initialData?.customer?.address?.zipCode ||
              prev.customer.address.zipCode,
            country:
              initialData?.customer?.address?.country ||
              prev.customer.address.country,
          },
        },
        travelerSummary: {
          ...prev.travelerSummary,
          adults:
            initialData?.travelerSummary?.adults || prev.travelerSummary.adults,
          children:
            initialData?.travelerSummary?.children ||
            prev.travelerSummary.children,
          infants:
            initialData?.travelerSummary?.infants ||
            prev.travelerSummary.infants,
          totalTravelers:
            initialData?.travelerSummary?.totalTravelers ||
            prev.travelerSummary.totalTravelers,
        },
        destination: initialData?.destination || prev.destination,
        travelDate: initialData?.travelDate || prev.travelDate,
        startDate: initialData?.startDate || prev.startDate,
        endDate: initialData?.endDate || prev.endDate,
        pricing: {
          ...prev.pricing,
          baseAmount:
            initialData?.pricing?.baseAmount || prev.pricing.baseAmount,
          discountAmount:
            initialData?.pricing?.discountAmount || prev.pricing.discountAmount,
          taxableAmount:
            initialData?.pricing?.taxableAmount || prev.pricing.taxableAmount,
          gstPercentage:
            initialData?.pricing?.gstPercentage || prev.pricing.gstPercentage,
          gstAmount: initialData?.pricing?.gstAmount || prev.pricing.gstAmount,
          tcsAmount: initialData?.pricing?.tcsAmount || prev.pricing.tcsAmount,
          tcsPercentage:
            initialData?.pricing?.tcsPercentage || prev.pricing.tcsPercentage,
          totalAmount:
            initialData?.pricing?.totalAmount || prev.pricing.totalAmount,
          amountInWords:
            initialData?.pricing?.amountInWords || prev.pricing.amountInWords,
          tcsClaim: initialData?.pricing?.tcsClaim || prev.pricing.tcsClaim,
          otherCharges:
            initialData?.pricing?.otherCharges || prev.pricing.otherCharges,
        },
        payment: {
          ...prev.payment,
          dueDate: initialData?.payment?.dueDate || prev.payment.dueDate,
          totalPaid: initialData?.payment?.totalPaid || prev.payment.totalPaid,
          balanceAmount:
            initialData?.payment?.balanceAmount || prev.payment.balanceAmount,
          installments:
            initialData?.payment?.installments || prev.payment.installments,
        },
        cancellationPolicy: {
          ...prev.cancellationPolicy,
          flights:
            initialData?.cancellationPolicy?.flights ||
            prev.cancellationPolicy.flights,
          hotel:
            initialData?.cancellationPolicy?.hotel ||
            prev.cancellationPolicy.hotel,
          land:
            initialData?.cancellationPolicy?.land ||
            prev.cancellationPolicy.land,
          nonRefundableComponents:
            initialData?.cancellationPolicy?.nonRefundableComponents ||
            prev.cancellationPolicy.nonRefundableComponents,
          jrCancellationChargePerPax:
            initialData?.cancellationPolicy?.jrCancellationChargePerPax ||
            prev.cancellationPolicy.jrCancellationChargePerPax,
          rescheduleChargePerPax:
            initialData?.cancellationPolicy?.rescheduleChargePerPax ||
            prev.cancellationPolicy.rescheduleChargePerPax,
          latePaymentFee:
            initialData?.cancellationPolicy?.latePaymentFee ||
            prev.cancellationPolicy.latePaymentFee,
        },
        deliverables: initialData?.deliverables || prev.deliverables,
        notes: initialData?.notes || prev.notes,
        meta: {
          ...prev.meta,
          createdBy: initialData?.meta?.createdBy || prev.meta.createdBy,
          companyProfileId:
            initialData?.meta?.companyProfileId || prev.meta.companyProfileId,
          companyName: initialData?.meta?.companyName || prev.meta.companyName,
          bankDetails: initialData?.meta?.bankDetails || prev.meta.bankDetails,
          source: initialData?.meta?.source || prev.meta.source,
        },
        auditTrail: initialData?.auditTrail || prev.auditTrail,
      }));
    }
  }, [initialData]);

  // Prefill from navigation params (customer, dest, pax, date)
  useEffect(() => {
    setFormData((prev) => {
      const pax = defaultPax
        ? parseInt(defaultPax, 10) || 0
        : prev.travelerSummary.totalTravelers;
      return {
        ...prev,
        customer: {
          ...prev.customer,
          name: defaultCustomerName || prev.customer.name,
          email: defaultEmail || prev.customer.email,
          contact: defaultContact || prev.customer.contact,
        },
        destination: defaultDestination || prev.destination,
        travelDate: defaultTravelDate || prev.travelDate,
        travelerSummary: {
          ...prev.travelerSummary,
          totalTravelers: pax || prev.travelerSummary.totalTravelers,
          adults: pax || prev.travelerSummary.adults,
        },
      };
    });
  }, [
    defaultCustomerName,
    defaultEmail,
    defaultContact,
    defaultDestination,
    defaultPax,
    defaultTravelDate,
  ]);

  // Load user profile

  const fetchQuotations = async () => {
    try {
      setQuotationsLoading(true);
      const response = await fetch(
        `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/quotations?TripId=${tripId}`
      );

      if (!response.ok) throw new Error("Failed to fetch quotations");

      const data = await response.json();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("Error", "Failed to load quotations");
    } finally {
      setQuotationsLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await fetch(
        `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote?company=${userProfile?.user?.company}&tripId=${tripId}`
      );

      if (!response.ok) throw new Error("Failed to fetch quotations");

      const data = await response.json();
      setTripDetail(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("Error", "Failed to load quotations");
    }
  };

  const handleQuotationSelectFromPicker = (quoteId) => {
    const quotation = quotations.find((q) => q.QuoteId === quoteId);
    if (quotation) {
      handleSelectQuotation(quotation);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const updateAddressField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        address: {
          ...prev.customer.address,
          [field]: value,
        },
      },
    }));
  };

  const addInstallment = () => {
    console.log("Adding new installment...");
    setFormData((prev) => {
      const currentInstallments = prev?.payment?.installments || [];
      const newInstallments = [
        ...currentInstallments,
        {
          sequence: currentInstallments.length + 1,
          installmentAmount: 0,
          installmentDate: "",
          status: "Pending",
        },
      ];
      console.log("New installments array:", newInstallments);
      return {
        ...prev,
        payment: {
          ...prev.payment,
          installments: newInstallments,
        },
      };
    });
  };

  const removeInstallment = (index) => {
    if ((formData?.payment?.installments?.length || 0) <= 1) {
      toast.error("Error", "At least one installment is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        installments: (prev?.payment?.installments || []).filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const updateInstallment = (index, field, value) => {
    console.log(`Updating installment ${index}, ${field}:`, value);
    setFormData((prev) => {
      const updatedInstallments = (prev?.payment?.installments || []).map(
        (inst, i) => (i === index ? { ...inst, [field]: value } : inst)
      );
      console.log("Updated installments:", updatedInstallments);
      return {
        ...prev,
        payment: {
          ...prev.payment,
          installments: updatedInstallments,
        },
      };
    });
  };

  const addTcsClaim = () => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        tcsClaim: [
          ...(prev.pricing.tcsClaim || []),
          { panNumber: "", name: "", percentage: 0 },
        ],
      },
    }));
  };

  const removeTcsClaim = (index) => {
    if (!formData.pricing.tcsClaim || formData.pricing.tcsClaim.length <= 1) {
      toast.error("Error", "At least one TCS claim entry is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        tcsClaim: (prev.pricing.tcsClaim || []).filter((_, i) => i !== index),
      },
    }));
  };

  const updateTcsClaim = (index, field, value) => {
    setFormData((prev) => {
      const currentClaims = Array.isArray(prev.pricing.tcsClaim)
        ? [...prev.pricing.tcsClaim]
        : [];

      if (index >= currentClaims.length) {
        currentClaims.push({ panNumber: "", name: "", percentage: 0 });
      }

      const updatedClaims = currentClaims.map((claim, i) =>
        i === index ? { ...claim, [field]: value } : claim
      );

      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          tcsClaim: updatedClaims,
        },
      };
    });
  };

  const calculateInvoiceTotal = () => {
    const baseAmount = parseFloat(formData?.pricing?.totalAmount) || 0;
    const gst = parseFloat(formData?.pricing?.gstAmount) || 0;
    const tcs = parseFloat(formData?.pricing?.tcsAmount) || 0;
    return baseAmount + gst + tcs;
  };

  const generateInvoiceNumberValue = () => {
    const companyName = userProfile?.organization?.details?.companyname || "JR";
    const initials =
      companyName
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase())
        .join("")
        .substring(0, 3) || "INV";
    const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
    return `${initials}-Inv-${timestamp}`;
  };

  const ensureInvoiceNumber = () => {
    if (formData.invoiceNumber && formData.invoiceNumber.length > 0) {
      return formData.invoiceNumber;
    }
    const newNumber = generateInvoiceNumberValue();
    setFormData((prev) => ({ ...prev, invoiceNumber: newNumber }));
    return newNumber;
  };

  const handleOpenPreview = async () => {
    if (!validateForm()) return;
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const dataWithUser = {
        ...formData,
        company: userProfile?.user?.company,
      };

      console.log("Invoice data with user:", dataWithUser);

      // Call the API endpoint to get HTML
      const response = await axios.post(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html",
        {
          type: "invoice",
          data: dataWithUser,
          templateName: userProfile?.user?.Preference?.invoicepdf || userProfile?.user?.invoicepdf,
          mode: "html",
          tripId: formData?.tripId,
        }
      );

      if (response.data) {
        console.log("HTML Content received from API");
        setPdfHtml(response.data);
        setPdfUri(null);
        setFormDataToSubmit({
          ...dataWithUser,
          CompanyId: userProfile?.user?.company,
          CompanyEmail: userProfile?.user?.Email,
        });
        setShowPdfModal(true);
        setRefreshKey((prev) => prev + 1);
        console.log("✅ HTML set for preview");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("❌ Error generating preview:", error);
      toast.error("Error", "Failed to generate preview. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePreviewClose = () => {
    setShowPdfModal(false);
  };

  const handleShare = async () => {
    if (!formDataToSubmit) {
      toast.error("Error", "No invoice data to submit");
      return;
    }

    try {
      console.log("📤 Submitting invoice to API...");
      await handleSubmitInvoice();
    } catch (error) {
      console.error("❌ Error submitting:", error);
      toast.error(
        "Error",
        "Failed to submit invoice: " + (error?.message || error)
      );
    }
  };

  const handleSelectQuotation = (quotation) => {
    if (!quotation) return;

    const totalCost =
      (Number(quotation.Costs?.FlightCost) || 0) +
      (Number(quotation.Costs?.VisaCost) || 0) +
      (Number(quotation.Costs?.LandPackageCost) || 0);
    console.log(totalCost);
    const adults =
      (quotation.NoOfPax || 0) -
      (quotation.Child || 0) -
      (parseInt(quotation.Infant) || 0);

    setSelectedQuotation(quotation);
    setFormData((prev) => ({
      ...prev,
      finalPackageQuotationId: quotation.QuoteId || "",
      leadId: quotation.LeadId || "",
      customer: {
        ...prev.customer,
        name: quotation["Client-Name"] || "",
        email: quotation["Client-Email"] || "",
        contact: quotation["Client-Contact"] || "",
      },
      destination: quotation.DestinationName || "",
      startDate: quotation.TravelDate || "",
      endDate: quotation.TravelEndDate || "",
      // travelDate: quotation.TravelDate || "",
      travelerSummary: {
        ...prev.travelerSummary,
        adults: adults,
        children: quotation.Child || 0,
        infants: parseInt(quotation.Infant) || 0,
        totalTravelers: quotation.NoOfPax || 0,
      },
      packageSummary: {
        ...prev.packageSummary,
        nights: quotation.Nights || 0,
        days: quotation.Days || 0,
        packageName: quotation.QuoteId || "",
      },
      pricing: {
        ...prev.pricing,
        baseAmount: quotation.Costs?.TotalCost || totalCost,
        gstAmount: quotation.Costs?.GSTAmount || 0,
        tcsAmount: quotation.Costs?.TCSAmount || 0,
        totalAmount: totalCost,
      },
    }));
    setStep("fillForm");
  };
  const navigate = useNavigate();
  const validateForm = () => {
    if (!formData.finalPackageQuotationId) {
      toast.error("Please select a quotation");
      return false;
    }
    if (!formData.customer.name) {
      toast.error("Customer name is required");
      return false;
    }
    if (!formData.pricing.totalAmount) {
      toast.error("Error", "Total amount is required");
      return false;
    }
    return true;
  };
  const query = useQueryClient();
  const handleSubmitInvoice = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const invoiceNumber = ensureInvoiceNumber();
      const today = new Date().toISOString();

      const auditEntry = {
        action: "Created",
        timestamp: today,
        performedBy: userProfile?.user?.Email || "system",
        changes: {
          status: "FullFilled",
          invoiceNumber,
        },
      };

      const cleanedData = {
        invoiceNumber,
        invoiceId: formData.tripId || tripId,
        tripId: formData.tripId || tripId,
        finalPackageQuotationId: formData.finalPackageQuotationId,
        customer: formData.customer,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelDate: formData.travelDate,
        travelerSummary: formData.travelerSummary,
        pricing: formData.pricing,
        payment: formData.payment,
        cancellationPolicy: formData.cancellationPolicy,
        deliverables: formData.deliverables,
        notes: formData.notes,
        invoiceDate: today.split("T")[0],
        meta: {
          createdBy: userProfile?.user?.Email || "",
          companyProfileId: userProfile?.user?.company || "",
          companyName: userProfile?.organization?.details?.companyname || "",
          bankDetails: userProfile?.organization?.financials || {},
          source: "Website",
        },
        auditTrail: [auditEntry],
      };

      console.log("📋 Invoice Payload:", cleanedData);
      console.log("💰 Installments Data:", cleanedData.payment.installments);

      const response = await fetch(
        "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/invoice-management/invoice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedData),
        }
      );
      if (!response.ok) {
        const text = await response.text();
        console.log("Invoice API error:", text);
        throw new Error("Failed to save invoice");
      }

      let data = null;
      try {
        data = await response.json();
        console.log(tripData, "dojojopij");
        await axios.put(
          `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote`,
          {
            invoiceId: data?.invoiceId,
            TripId: TripDetail[0]?.TripId,
            LeadId: TripDetail[0]?.LeadId,
            company: TripDetail[0]?.company,
            CreatedAt: TripDetail[0]?.CreatedAt,
            LatestQuotationId: cleanedData?.finalPackageQuotationId,
            InvoiceCreated: true,
          }
        );
        setTimeout(() => {
          navigate("/followup");
        }, 1000);
      } catch {
        toast.error("Error", "Failed to update lead");
      }
      await query.invalidateQueries({ queryKey: ["followup"] });

      toast.success("Success", "Invoice submitted successfully!", [
        {
          text: "OK",
          onPress: () => {
            setShowPdfModal(false);
            if (onSubmit) {
              onSubmit(data || cleanedData);
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Error", error.message || "Failed to save invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quotationOptions = quotations.map((q) => ({
    label: `${q.QuoteId} - ₹${q.Costs?.TotalCost?.toLocaleString("en-IN") || 0
      }`,
    value: q.QuoteId,
  }));

  // Form Filling Step
  return (
    <div className="flex-1 bg-gray-50 overflow-auto p-6">
      <div className="p-1">
        {selectedQuotation && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4 flex justify-between items-center">
            <span className="text-blue-800">
              Using Quotation #
              {selectedQuotation?.QuoteId || selectedQuotation?.id}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <span className="text-2xl font-bold text-gray-900 mb-2 block">
            Create Invoice
          </span>
          <span className="text-gray-600 block">
            Select a quotation and fill in the details
          </span>
        </div>

        {/* Quotation Selection */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <span className="text-lg font-semibold text-gray-900 mb-3 block">
            Select Quotation
          </span>
          {quotationsLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          ) : (
            <CustomPicker
              items={quotationOptions}
              selectedValue={formData?.finalPackageQuotationId}
              onValueChange={handleQuotationSelectFromPicker}
              placeholder="Select a quotation"
              title="Select Quotation"
            />
          )}
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <span className="text-lg font-semibold text-gray-900 mb-3 block">
            Customer Details
          </span>

          <span className="text-sm font-medium text-gray-700 mb-2 block">
            Name *
          </span>
          <input
            className="border border-gray-300 rounded-lg p-3 mb-3 bg-white w-full"
            value={formData?.customer?.name || ""}
            onChange={(e) =>
              updateNestedField("customer", "name", e.target.value)
            }
            placeholder="Customer name"
          />

          <span className="text-sm font-medium text-gray-700 mb-2 block">
            Email
          </span>
          <input
            className="border border-gray-300 rounded-lg p-3 mb-3 bg-white w-full"
            value={formData?.customer?.email || ""}
            onChange={(e) =>
              updateNestedField("customer", "email", e.target.value)
            }
            placeholder="customer@email.com"
            type="email"
          />

          <span className="text-sm font-medium text-gray-700 mb-2 block">
            Contact
          </span>
          <input
            className="border border-gray-300 rounded-lg p-3 mb-3 bg-white w-full"
            value={formData?.customer?.contact || ""}
            onChange={(e) =>
              updateNestedField("customer", "contact", e.target.value)
            }
            placeholder="Phone number"
            type="tel"
          />

          {/* Address */}
          <span className="text-base font-semibold text-gray-900 mt-3 mb-2 block">
            Address
          </span>

          <span className="text-sm font-medium text-gray-700 mb-2 block">
            Street
          </span>
          <input
            className="border border-gray-300 rounded-lg p-3 mb-3 bg-white w-full"
            value={formData?.customer?.address?.street || ""}
            onChange={(e) => updateAddressField("street", e.target.value)}
            placeholder="Street address"
          />

          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                City
              </span>
              <input
                className="border border-gray-300 rounded-lg p-3 bg-white w-full"
                value={formData?.customer?.address?.city || ""}
                onChange={(e) => updateAddressField("city", e.target.value)}
                placeholder="City"
              />
            </div>

            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                State
              </span>
              <input
                className="border border-gray-300 rounded-lg p-3 bg-white w-full"
                value={formData?.customer?.address?.state || ""}
                onChange={(e) => updateAddressField("state", e.target.value)}
                placeholder="State"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Zip Code
              </span>
              <input
                className="border border-gray-300 rounded-lg p-3 bg-white w-full"
                value={formData?.customer?.address?.zipCode || ""}
                onChange={(e) => updateAddressField("zipCode", e.target.value)}
                placeholder="Zip"
                type="number"
              />
            </div>

            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Country
              </span>
              <input
                className="border border-gray-300 rounded-lg p-3 bg-white w-full"
                value={formData?.customer?.address?.country || ""}
                onChange={(e) => updateAddressField("country", e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <span className="text-lg font-semibold text-gray-900 mb-3 block">
            Financial Details
          </span>

          {/* Package Amount (Read-only from quotation) */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <span className="text-sm text-gray-600 mb-1 block">
              Package Amount
            </span>
            <span className="text-2xl font-bold text-gray-900 block">
              ₹
              {parseFloat(formData?.pricing?.totalAmount || 0).toLocaleString(
                "en-IN"
              )}
            </span>
            <span className="text-xs text-gray-500 mt-1 block">
              From selected quotation
            </span>
          </div>

          {/* Editable GST and TCS */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                GST (₹)
              </span>
              <input
                className="border border-gray-300 rounded-lg p-3 bg-white w-full"
                value={(formData?.pricing?.gstAmount || 0).toString()}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: {
                      ...prev.pricing,
                      gstAmount: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                placeholder="GST amount"
                type="number"
              />
            </div>

            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                TCS (₹)
              </span>
              <input
                className="border border-gray-300 rounded-lg p-3 bg-white w-full"
                value={(formData?.pricing?.tcsAmount || 0).toString()}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: {
                      ...prev.pricing,
                      tcsAmount: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                placeholder="TCS amount"
                type="number"
              />
            </div>
          </div>

          {/* Invoice Total Calculation */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <span className="text-sm font-semibold text-gray-700 mb-2 block">
              Invoice Breakdown
            </span>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Package Amount:</span>
                <span className="font-semibold text-gray-900">
                  ₹
                  {parseFloat(
                    formData?.pricing?.totalAmount || 0
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700">GST:</span>
                <span className="font-semibold text-gray-900">
                  ₹
                  {parseFloat(formData?.pricing?.gstAmount || 0).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700">TCS:</span>
                <span className="font-semibold text-gray-900">
                  ₹
                  {parseFloat(formData?.pricing?.tcsAmount || 0).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="border-t border-purple-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-purple-700">
                    Invoice Total:
                  </span>
                  <span className="text-lg font-bold text-purple-700">
                    ₹{calculateInvoiceTotal().toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Installments */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-900">
              Installments
            </span>
            <button
              onClick={addInstallment}
              className="bg-purple-600 rounded-lg px-4 py-2 flex items-center"
            >
              <Plus size={16} className="text-white" />
              <span className="text-white font-medium ml-1">Add</span>
            </button>
          </div>

          {formData?.payment?.installments?.map((installment, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">
                  Installment {index + 1}
                </span>
                {formData?.payment?.installments?.length > 1 && (
                  <button
                    onClick={() => removeInstallment(index)}
                    className="bg-red-100 rounded-full p-1"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                )}
              </div>

              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Amount (₹)
              </span>
              <input
                className="border border-gray-300 rounded-lg p-3 mb-3 bg-white w-full"
                value={installment.installmentAmount.toString()}
                onChange={(e) =>
                  updateInstallment(
                    index,
                    "installmentAmount",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="Installment amount"
                type="number"
              />

              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Installment Date
              </span>
              <CalendarDatePicker
                value={installment.installmentDate}
                onDateChange={(value) =>
                  updateInstallment(index, "installmentDate", value)
                }
                placeholder="Select installment date"
              />
            </div>
          ))}

          {/* Installment Summary */}
          <div className="bg-purple-50 rounded-lg p-3 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Installments:</span>
              <span className="font-semibold text-gray-900">
                ₹
                {(formData?.payment?.installments || [])
                  .reduce((sum, inst) => sum + (inst.installmentAmount || 0), 0)
                  .toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between mt-1">
              <span className="text-gray-700">
                Invoice Total (with GST & TCS):
              </span>
              <span className="font-semibold text-purple-700">
                ₹{calculateInvoiceTotal().toLocaleString("en-IN")}
              </span>
            </div>

            {calculateInvoiceTotal() > 0 &&
              (formData?.payment?.installments || []).reduce(
                (sum, inst) => sum + (inst.installmentAmount || 0),
                0
              ) !== calculateInvoiceTotal() && (
                <span className="text-red-600 text-xs mt-2 block">
                  ⚠️ Installments don&apos;t match invoice total (₹
                  {calculateInvoiceTotal().toLocaleString("en-IN")})
                </span>
              )}
          </div>
        </div>

        {/* Cancellation Details */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <span className="text-lg font-semibold text-gray-900 mb-3 block">
            Cancellation Policy
          </span>
          <textarea
            className="border border-gray-300 rounded-lg p-3 bg-white w-full"
            value={formData?.cancellationPolicy?.flights || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                cancellationPolicy: {
                  ...prev.cancellationPolicy,
                  flights: e.target.value,
                },
              }))
            }
            placeholder="Enter cancellation policy details..."
            rows={8}
          />
        </div>

        {/* TCS Claim */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-900">
              TCS Claim
            </span>
            <button
              onClick={addTcsClaim}
              className="bg-purple-600 rounded-lg px-4 py-2 flex items-center"
            >
              <Plus size={16} className="text-white" />
              <span className="text-white font-medium ml-1">Add</span>
            </button>
          </div>

          {formData?.pricing?.tcsClaim &&
            Array.isArray(formData.pricing.tcsClaim) &&
            formData.pricing.tcsClaim.map((claim, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">
                    TCS Claim {index + 1}
                  </span>
                  {formData.pricing.tcsClaim.length > 1 && (
                    <button
                      onClick={() => removeTcsClaim(index)}
                      className="bg-red-100 rounded-full p-1"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  )}
                </div>

                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  PAN Number
                </span>
                <input
                  className="border border-gray-300 rounded-lg p-3 mb-3 bg-white w-full uppercase"
                  value={claim.panNumber}
                  onChange={(e) =>
                    updateTcsClaim(index, "panNumber", e.target.value)
                  }
                  placeholder="PAN Number"
                />

                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  Name
                </span>
                <input
                  className="border border-gray-300 rounded-lg p-3 mb-3 bg-white w-full"
                  value={claim.name}
                  onChange={(e) =>
                    updateTcsClaim(index, "name", e.target.value)
                  }
                  placeholder="Name"
                />

                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  Percentage (%)
                </span>
                <input
                  className="border border-gray-300 rounded-lg p-3 bg-white w-full"
                  value={claim.percentage.toString()}
                  onChange={(e) =>
                    updateTcsClaim(
                      index,
                      "percentage",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Percentage"
                  type="number"
                />
              </div>
            ))}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <span className="text-lg font-semibold text-gray-900 mb-3 block">
            Notes
          </span>
          <textarea
            className="border border-gray-300 rounded-lg p-3 bg-white w-full"
            value={formData?.notes || ""}
            onChange={(e) => updateFormData("notes", e.target.value)}
            placeholder="Additional notes..."
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6 mb-8">
          <button
            onClick={() => setStep("selectQuotation")}
            className="border border-purple-600 rounded-xl p-4 flex-1 mr-2 items-center justify-center"
          >
            <span className="text-purple-600 font-bold">Back</span>
          </button>
          <button
            onClick={handleOpenPreview}
            className="bg-purple-600 rounded-xl p-4 flex-1 ml-2 items-center justify-center"
          >
            <span className="text-white font-bold">Preview & Save</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
            <span className="text-gray-900">Preparing Preview...</span>
          </div>
        </div>
      )}

      <PdfPreviewModal
        key={refreshKey}
        visible={showPdfModal}
        pdfUri={pdfUri}
        pdfHtml={pdfHtml}
        onClose={handlePreviewClose}
        onShare={handleShare}
      />
    </div>
  );
}
