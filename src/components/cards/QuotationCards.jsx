import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Plane,
  ArrowRight,
  Calendar,
  IndianRupee,
  Users,
  MapPin,
  Phone
} from 'lucide-react';

const QuotationCards = ({ leadData }) => {
  const navigate = useNavigate();
  const tripId = leadData?.TripId || 'Lead';
  const clientName = leadData?.clientName || 'Unknown Client';
  const contact = leadData?.clientContact || 'No contact';
  const destination = leadData?.destination || 'Not specified';
  const departure = leadData?.departureCity || 'Not specified';
  const adults = leadData?.pax || 0;
  const children = leadData?.child || 0;
  const days = leadData?.days || 0;
  const travelDate = (() => {
    const raw = leadData?.travelDate;
    if (!raw) return 'Not set';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return 'Not set';
    return d.toLocaleDateString();
  })();
  const leadSource = leadData?.leadSource || 'Unknown';
  const budgetValue = Number(leadData?.budget || 0);
  const budgetText = budgetValue > 0 && Number.isFinite(budgetValue)
    ? `₹${budgetValue.toLocaleString()}`
    : 'Not specified';

  const handleCreateQuote = useMemo(
    () => () => {
      const uniqueId =
        leadData?.TripId ||
        leadData?.id ||
        leadData?._id ||
        `${leadData?.clientContact || 'LEAD'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const formattedLeadData = {
                CreatedAt:leadData?.CreatedAt,

        TripId: leadData?.TripId,
        company: leadData?.company,
        sk: leadData?.sk,
        LeadId: leadData?.LeadId,
        Quotations: leadData?.Quotations,
        ClientLeadDetails: {
          FullName: leadData?.clientName || '',
          Contact: leadData?.clientContact || '',
          Email: leadData?.clientEmail || '',
          TravelDate: leadData?.travelDate || '',
          Pax: leadData?.pax || '1',
          Child: leadData?.child || '0',
          Infant: leadData?.infant || '0',
          Budget: leadData?.budget || '',
          DepartureCity: leadData?.departureCity || '',
          DestinationName: leadData?.destination || '',
          Days: leadData?.days || 2,
        },
        AssignDate: new Date().toISOString().split('T')[0],
      };

      navigate('/create-newquote', { state: { leadData: formattedLeadData } });
    },
    [leadData, navigate]
  );

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-purple-600 via-fuchsia-600 to-emerald-500" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="shrink-0 rounded-xl bg-purple-50 p-2.5 ring-1 ring-purple-100">
              <Plane className="h-5 w-5 text-purple-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900 truncate" title={clientName}>{clientName}</p>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {tripId}
                </span>
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-100">
                  {leadSource}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="truncate" title={contact}>{contact}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateQuote}
            className="hidden bg-gradient-to-r from-purple-600 via-fuchsia-600 to-red-500 cursor-pointer sm:inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-white ring-1 ring-gray-200 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Create quote"
          >
            Create
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <MapPin className="h-4 w-4 text-gray-400" />
              Route
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              <span title={destination}>{destination}</span>
              <span className="mx-2 text-gray-300">→</span>
              <span title={departure}>{departure}</span>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Users className="h-4 w-4 text-gray-400" />
              Pax
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {adults} Adults
              <span className="mx-2 text-gray-300">•</span>
              {children} Children
              <span className="mx-2 text-gray-300">•</span>
              {days} Days
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Calendar className="h-4 w-4 text-gray-400" />
              Travel date
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">{travelDate}</div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <IndianRupee className="h-4 w-4 text-gray-400" />
              Budget
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {budgetText}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuotationCards;