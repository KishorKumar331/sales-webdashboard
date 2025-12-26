import React from 'react';
import Navbar from '../components/Navbar';

const CreateQuote = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Create Quote" />
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Create New Quote</h2>
          {/* Add your quote form here */}
          <p className="text-gray-600">Quote creation form will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default CreateQuote;
