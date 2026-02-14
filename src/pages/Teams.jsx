import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Calendar, CreditCard, Search, Filter, MoreVertical } from 'lucide-react';

const Teams = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = () => {
    const members = localStorage.getItem('teamMembers');
    if (members) {
      setTeamMembers(JSON.parse(members));
    }
  };

  const saveTeamMembers = (members) => {
    localStorage.setItem('teamMembers', JSON.stringify(members));
    setTeamMembers(members);
  };

  const handleSendOtp = async () => {
    if (!newMember.email || !newMember.name) {
      alert('Please fill in all required fields');
      return;
    }

    // Simulate OTP sending
    setOtpSent(true);
    alert(`OTP sent to ${newMember.email}`);
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') { // Simulated OTP
      setOtpVerified(true);
      alert('Email verified successfully!');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const handleAddMember = () => {
    if (!otpVerified) {
      alert('Please verify email first');
      return;
    }

    const member = {
      id: Date.now(),
      ...newMember,
      status: 'pending',
      joinDate: new Date().toISOString(),
      paymentStatus: 'pending'
    };

    const updatedMembers = [...teamMembers, member];
    saveTeamMembers(updatedMembers);

    // Reset form
    setNewMember({ name: '', email: '', phone: '' });
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setShowAddMember(false);
    setShowPaymentModal(true);
    setSelectedMember(member);
  };

  const handlePaymentSuccess = (memberId, paymentDetails) => {
    const updatedMembers = teamMembers.map(member => 
      member.id === memberId 
        ? { 
            ...member, 
            status: 'active',
            paymentStatus: 'paid',
            paymentDetails: {
              ...paymentDetails,
              timestamp: new Date().toISOString()
            }
          }
        : member
    );
    saveTeamMembers(updatedMembers);
    setShowPaymentModal(false);
    setSelectedMember(null);
    alert('Team member added successfully!');
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their access</p>
        </div>
        <button
          onClick={() => setShowAddMember(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Team
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'add'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Add Member
          </button>
        </nav>
      </div>

      {/* Manage Team Tab */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded-lg shadow">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Team Members List */}
          <div className="divide-y divide-gray-200">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No team members found</p>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Add your first team member
                </button>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  {member.paymentDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          Payment: {member.paymentDetails.paymentId?.slice(-8) || 'Completed'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(member.paymentDetails.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Member Tab */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Team Member</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
              >
                Send OTP
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleVerifyOtp}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Verify OTP
                  </button>
                  <button
                    onClick={handleSendOtp}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {otpVerified && (
              <button
                onClick={handleAddMember}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
              >
                Add Team Member
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                >
                  Send OTP
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleVerifyOtp}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Verify OTP
                    </button>
                    <button
                      onClick={handleSendOtp}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <button
                  onClick={handleAddMember}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                >
                  Add Team Member
                </button>
              )}

              <button
                onClick={() => {
                  setShowAddMember(false);
                  setNewMember({ name: '', email: '', phone: '' });
                  setOtp('');
                  setOtpSent(false);
                  setOtpVerified(false);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedMember && (
        <PaymentModal
          member={selectedMember}
          onSuccess={(paymentDetails) => handlePaymentSuccess(selectedMember.id, paymentDetails)}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ member, onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = () => {
    setIsLoading(true);

    const options = {
      description: `Team Member - ${member.name}`,
      image: 'https://i.imgur.com/3g7nmJC.png',
      currency: 'INR',
      key: 'rzp_test_S5OVwU720vAaEY',
      amount: '99900', // ₹999 in paise
      name: 'Journey Routers',
      order_id: '',
      prefill: {
        email: member.email,
        contact: member.phone || '',
        name: member.name,
      },
      theme: { color: '#7c3aed' },
    };

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        initializeRazorpay(options);
      };
      document.body.appendChild(script);
    } else {
      initializeRazorpay(options);
    }
  };

  const initializeRazorpay = (options) => {
    const razorpay = new window.Razorpay(options);
    
    razorpay.open();
    
    razorpay.on('payment.success', async (response) => {
      console.log('Payment Success:', response);
      onSuccess({
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
        amount: '₹999'
      });
      setIsLoading(false);
    });
    
    razorpay.on('payment.error', (response) => {
      console.log('Payment Error:', response);
      alert('Payment failed. Please try again.');
      setIsLoading(false);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Complete Team Member Setup</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Team Member Details</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Name:</strong> {member.name}</p>
            <p><strong>Email:</strong> {member.email}</p>
            {member.phone && <p><strong>Phone:</strong> {member.phone}</p>}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-900 font-medium">Team Member License</span>
            <span className="text-purple-900 font-bold">₹999</span>
          </div>
          <p className="text-purple-700 text-sm">One-time payment for team member access</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Pay ₹999 & Add Team Member'
          )}
        </button>
      </div>
    </div>
  );
};

export default Teams;
