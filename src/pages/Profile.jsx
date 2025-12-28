import React from 'react';
import Navbar from '../components/Navbar';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
          <p className="text-gray-600">User profile information will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
