import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/Forms/InvoiceForm';

const InvoicePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { initialData, tripId, isEdit } = location.state || {};

  const handleSubmit = () => {
    // Handle successful submission
    navigate('/follow-up'); // or navigate back to previous page
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="w-full">
      <InvoiceForm
        tripId={tripId}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={isEdit}
      />
    </div>
  );
};

export default InvoicePage;
