import React, { useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
   
  CheckCircle, 
  FileText,
  AlertCircle,
  Plus,
  Plane
} from 'lucide-react';

const QuotationCards = ({ leadData }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLastQuotesModalVisible, setIsLastQuotesModalVisible] = useState(false);
  const sliderRef = useRef(null);

  const pages = useMemo(() => ['main'], []);

  const scrollToPage = useCallback((index) => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${index * 100}%)`;
      setPage(index);
    }
  }, []);

  const QuotationButton = useMemo(() => () => (
    <div className="flex justify-between mt-4">
      <button
        onClick={() => {
          const uniqueId = leadData?.TripId || 
            leadData?.id || 
            leadData?._id || 
            `${leadData?.['Client-Contact'] || 'LEAD'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          const formattedLeadData = {
            TripId: uniqueId,
            LeadId: leadData?.LeadId,
            Quotations: leadData?.Quotations,
            ClientLeadDetails: {
              FullName: leadData?.['Client-Name'] || '',
              Contact: leadData?.['Client-Contact'] || '',
              Email: leadData?.['Client-Email'] || '',
              TravelDate: leadData?.['Client-TravelDate'] || '',
              Pax: leadData?.['Client-Pax'] || '1',
              Child: leadData?.['Client-Child'] || '0',
              Infant: '0',
              Budget: leadData?.['Client-Budget'] || '',
              DepartureCity: leadData?.['Client-DepartureCity'] || '',
              DestinationName: leadData?.['Client-Destination'] || '',
              Days: leadData?.['Client-Days'] || 2,
            },
            AssignDate: new Date().toISOString().split('T')[0],
          };
          
          navigate('/create-newquote', { state: { leadData: formattedLeadData } });
        }}
        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex-1 ml-2 transition-colors"
      >
        Create Quote
      </button>
    </div>
  ), [navigate, leadData]);

  const renderPage = (item, index) => {
    if (item === 'main') {
      return (
        <div key="main" className="p-4 w-full flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8" />
            <div className="flex gap-4 items-center">
              <div className="bg-purple-100 rounded-full p-2">
                <Plane className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">
                  {leadData?.TripId || 'Lead'} 
                </span>
                <span className="text-gray-500 text-sm">
                  {leadData?.['Client-Name'] || 'Unknown Client'}
                </span>
              </div>
            </div>
            <button 
              className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">Contact</p>
            <p className="text-gray-900 font-semibold mb-3">
              {leadData?.['Client-Contact'] || 'No contact'}
            </p>
          </div>

          <div className="flex justify-between mb-3">
            <div>
              <p className="text-gray-500 text-xs">Destination</p>
              <p className="text-gray-900 font-medium">
                {leadData?.['Client-Destination'] || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Departure</p>
              <p className="text-gray-900 font-medium">
                {leadData?.['Client-DepartureCity'] || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <p className="text-gray-500 text-xs">Adults</p>
              <p className="text-gray-900 font-medium">{leadData?.['Client-Pax'] || 0}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Children</p>
              <p className="text-gray-900 font-medium">{leadData?.['Client-Child'] || 0}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Days</p>
              <p className="text-gray-900 font-medium">{leadData?.['Client-Days'] || 0}</p>
            </div>
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <p className="text-gray-500 text-xs">Travel Date</p>
              <p className="text-gray-900 font-medium">
                {leadData?.['Client-TravelDate']
                  ? new Date(leadData['Client-TravelDate']).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Lead Source</p>
              <p className="text-gray-900 font-medium">{leadData?.LeadSource || 'Unknown'}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">Budget</p>
            <p className="text-purple-600 text-2xl font-bold">
              {leadData?.['Client-Budget'] > 0
                ? `₹${Number(leadData['Client-Budget']).toLocaleString()}`
                : 'Budget not specified'}
            </p>
          </div>

          <QuotationButton />
        </div>
      );
    }

    return (
   null
    );
  };

  return (
    <div className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden">
      <div 
        ref={sliderRef}
        className="flex transition-transform duration-300 ease-in-out"
        style={{ width: `${pages.length * 100}%` }}
      >
        {pages.map((item, index) => renderPage(item, index))}
      </div>

   
    </div>
  );
};

export default QuotationCards;