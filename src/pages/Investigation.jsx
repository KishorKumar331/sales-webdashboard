import React from 'react';
import { Lock } from 'lucide-react';
import Navbar from '../components/Navbar';

const Investigation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Investigation" />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Investigation Locked</h2>
          <p className="text-gray-500 mb-6">
            The Investigation feature is currently under development and will be available soon.
          </p>
          <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg">
            Stay tuned for updates! We're working hard to bring you this feature.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investigation;
