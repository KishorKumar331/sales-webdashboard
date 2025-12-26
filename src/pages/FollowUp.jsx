import React from 'react';
import Navbar from '../components/Navbar';

const FollowUp = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Follow Ups" />
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Follow Up Leads</h2>
          <p className="text-gray-600">Follow-up leads will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default FollowUp;
