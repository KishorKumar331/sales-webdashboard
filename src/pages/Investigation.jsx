import React from 'react';
import Navbar from '../components/Navbar';

const Investigation = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Investigation" />
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Investigation</h2>
          <p className="text-gray-600">Investigation dashboard will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default Investigation;
