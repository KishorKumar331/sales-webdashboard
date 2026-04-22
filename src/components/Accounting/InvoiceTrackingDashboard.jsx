import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown, FileText, Grid, Table, Filter, Download, Eye, CheckCircle, Clock, XCircle, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const InvoiceTrackingDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [dateRange, setDateRange] = useState('month'); // 'month' or 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState({
    totalBilled: 0,
    totalReceived: 0,
    totalPending: 0,
    profitLoss: 0
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Get user email from localStorage or context

  const { user } = useAuth();
  // Fetch invoices from API
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const userEmail = user?.user?.Email;
      let start = startDate;
      let end = endDate;

      // If month view, calculate date range
      if (dateRange === 'month') {
        const [year, month] = selectedMonth.split('-');
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        start = firstDay.toISOString().split('T')[0];
        end = lastDay.toISOString().split('T')[0];
      }

      const response = await fetch(
        `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/invoice-management/invoice?companyEmail=${userEmail}&startDate=${start}&endDate=${end}&status=PENDING`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
      calculateSummary(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // For demo purposes, set mock data
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummary = (invoiceList) => {
    const totals = invoiceList.reduce(
      (acc, invoice) => {
        // Calculate total amount by summing all installments regardless of status
        const installments = invoice.payment?.installments || [];
        const totalAmount = installments.reduce((sum, p) => sum + (p.installmentAmount || 0), 0);

        const receivedAmount = installments
          .filter(p => p.status === 'Paid')
          .reduce((sum, p) => sum + (p.installmentAmount || 0), 0);

        const pendingAmount = installments
          .filter(p => p.status === 'Pending')
          .reduce((sum, p) => sum + (p.installmentAmount || 0), 0);

        acc.totalBilled += totalAmount;
        acc.totalReceived += receivedAmount;
        acc.totalPending += pendingAmount;

        return acc;
      },
      { totalBilled: 0, totalReceived: 0, totalPending: 0 }
    );

    totals.profitLoss = totals.totalReceived - totals.totalBilled;
    setSummary(totals);
  };

  const updateInstallmentStatus = async (invoiceId, installmentSequence, newStatus) => {
    try {
      setUpdatingStatus(true);

      // Get current invoice state from invoices array (not stale selectedInvoice)
      const currentInvoice = invoices.find(inv => inv.invoiceId === invoiceId);
      if (!currentInvoice) {
        throw new Error('Invoice not found');
      }

      // Create updated invoice with only the changed installment
      const updatedInvoicePayload = {
        ...currentInvoice,
        payment: {
          installments: currentInvoice.payment.installments.map(inst =>
            inst.sequence === installmentSequence
              ? { ...inst, status: newStatus }
              : inst
          )
        }
      };

      console.log('🔥 API Payload:', JSON.stringify(updatedInvoicePayload, null, 2));

      const response = await fetch(
        `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/invoice-management/invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedInvoicePayload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update installment status");
      }

      const result = await response.json();
      console.log('API Response:', result);
      console.log('API Response installments:', result.payment?.installments);

      // Use API response to update local state (not our payload)
      const apiUpdatedInvoice = result.payment?.installments ? {
        ...currentInvoice,
        payment: {
          ...currentInvoice.payment,
          installments: result.payment.installments
        }
      } : {
        ...currentInvoice,
        payment: {
          ...currentInvoice.payment,
          installments: currentInvoice.payment.installments.map(inst =>
            inst.sequence === installmentSequence
              ? { ...inst, status: newStatus }
              : inst
          )
        }
      };

      console.log('Final updated invoice for local state:', apiUpdatedInvoice);

      setSelectedInvoice(apiUpdatedInvoice);

      setInvoices(prev =>
        prev.map(inv =>
          inv.invoiceId === invoiceId ? apiUpdatedInvoice : inv
        )
      );

      calculateSummary(
        invoices.map(inv =>
          inv.invoiceId === invoiceId ? apiUpdatedInvoice : inv
        )
      );

      // Check if all installments are now paid and update invoice status
      const allInstallments = apiUpdatedInvoice.payment?.installments || [];
      const allPaid = allInstallments.every(installment => installment.status === 'Paid');

      console.log('Installments check:', {
        invoiceId,
        allInstallments: allInstallments.map(i => ({ sequence: i.sequence, status: i.status })),
        allPaid,
        installmentsLength: allInstallments.length
      });

      if (allPaid && allInstallments.length > 0) {
        console.log('All installments paid, updating invoice status to PAID');
      } else {
        console.log('Not all installments paid yet, skipping invoice status update');
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update installment status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update invoice status when all installments are paid removed as it was unused and causing errors

  // Open invoice detail modal
  const openInvoiceDetail = (invoice) => {
    setSelectedInvoice(invoice);
  };

  // Close modal
  const closeDetailModal = () => {
    setSelectedInvoice(null);
  };
  const setMockData = () => {
    const mockInvoices = [
      {
        invoiceId: "81U0LVX",
        invoiceNumber: "J-Inv-20260303",
        customer: { name: "kishor", email: "pacemeh626@telvetto.com" },
        destination: "Bali",
        startDate: "2026-03-03",
        endDate: "2026-03-04",
        pricing: { totalAmount: 14000, gstAmount: 2000, baseAmount: 12000 },
        payment: {
          installments: [
            { sequence: 1, installmentDate: "2026-03-03", installmentAmount: 10000, status: "Paid" },
            { sequence: 2, installmentDate: "2026-03-04", installmentAmount: 5000, status: "Pending" }
          ]
        },
        status: "PENDING",
        createdAt: "2026-03-03T11:06:37.425852+00:00"
      },
      {
        invoiceId: "92U1LWX",
        invoiceNumber: "J-Inv-20260304",
        customer: { name: "rahul", email: "rahul@example.com" },
        destination: "Dubai",
        startDate: "2026-03-04",
        endDate: "2026-03-06",
        pricing: { totalAmount: 25000, gstAmount: 3500, baseAmount: 21500 },
        payment: {
          installments: [
            { sequence: 1, installmentDate: "2026-03-04", installmentAmount: 25000, status: "Pending" }
          ]
        },
        status: "PENDING",
        createdAt: "2026-03-04T10:00:00.000000+00:00"
      }
    ];
    setInvoices(mockInvoices);
    calculateSummary(mockInvoices);
  };

  useEffect(() => {
    fetchInvoices();
  }, [dateRange, selectedMonth, startDate, endDate]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-100';
      case 'PAID': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'Overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="w-4 h-4" />;
      case 'PAID': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'Overdue': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Card View Component
  const InvoiceCard = ({ invoice }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openInvoiceDetail(invoice)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
          <p className="text-sm text-gray-500">ID: {invoice.invoiceId}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(invoice.status || 'Pending')}`}>
          {getStatusIcon(invoice.status || 'Pending')}
          {invoice.status || 'Pending'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Customer</span>
          <span className="text-sm font-medium">{invoice.customer?.name}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Destination</span>
          <span className="text-sm font-medium">{invoice.destination}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Travel Dates</span>
          <span className="text-sm font-medium">{invoice.startDate} - {invoice.endDate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Amount</span>
          <span className="text-lg font-bold text-purple-600">
            {formatCurrency(
              (invoice.payment?.installments || []).reduce((sum, p) => sum + (p.installmentAmount || 0), 0)
            )}
          </span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Received</span>
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(
                invoice.payment?.installments?.filter(p => p.status === 'Paid')
                  .reduce((sum, p) => sum + (p.installmentAmount || 0), 0)
              )}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pending</span>
            <span className="text-sm font-medium text-yellow-600">
              {formatCurrency(
                invoice.payment?.installments?.filter(p => p.status === 'Pending')
                  .reduce((sum, p) => sum + (p.installmentAmount || 0), 0)
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-1">
          <Eye className="w-4 h-4" />
          View
        </button>
        <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );

  // Table View Component
  const InvoiceTable = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.invoiceId} className="hover:bg-gray-50 cursor-pointer" onClick={() => openInvoiceDetail(invoice)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-gray-500">{invoice.invoiceId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.customer?.name}</div>
                  <div className="text-sm text-gray-500">{invoice.customer?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.destination}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.startDate} - {invoice.endDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                  {formatCurrency(
                    (invoice.payment?.installments || []).reduce((sum, p) => sum + (p.installmentAmount || 0), 0)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {formatCurrency(
                    invoice.payment?.installments?.filter(p => p.status === 'Paid')
                      .reduce((sum, p) => sum + (p.installmentAmount || 0), 0)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                  {formatCurrency(
                    invoice.payment?.installments?.filter(p => p.status === 'Pending')
                      .reduce((sum, p) => sum + (p.installmentAmount || 0), 0)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status || 'Pending')}`}>
                    {invoice.status || 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button className="text-purple-600 hover:text-purple-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Invoice Detail Modal
  const InvoiceDetailModal = () => {
    if (!selectedInvoice) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
        onClick={closeDetailModal}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</h2>
              <p className="text-sm text-gray-500">Invoice ID: {selectedInvoice.invoiceId}</p>
            </div>
            <button
              onClick={closeDetailModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedInvoice.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedInvoice.customer?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium">{selectedInvoice.customer?.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="font-medium">{selectedInvoice.destination}</p>
                </div>
              </div>
            </div>

            {/* Installments */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Installments</h3>
              <div className="space-y-3">
                {selectedInvoice.payment?.installments?.map((installment) => (
                  <div key={installment.sequence} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Installment {installment.sequence}</p>
                        <p className="text-sm text-gray-600">Due: {installment.installmentDate}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-purple-600">
                          {formatCurrency(installment.installmentAmount)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(installment.status)}`}>
                          {getStatusIcon(installment.status)}
                          {installment.status}
                        </span>
                      </div>
                    </div>

                    {/* Status Change Buttons */}
                    <div className="flex gap-2">
                      {installment.status === 'Pending' && (
                        <button
                          onClick={() => updateInstallmentStatus(selectedInvoice.invoiceId, installment.sequence, 'Paid')}
                          disabled={updatingStatus}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {updatingStatus ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Mark as Paid
                            </>
                          )}
                        </button>
                      )}

                      {installment.status === 'Paid' && (
                        <button
                          onClick={() => updateInstallmentStatus(selectedInvoice.invoiceId, installment.sequence, 'Pending')}
                          disabled={updatingStatus}
                          className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {updatingStatus ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4" />
                              Mark as Pending
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(
                      (selectedInvoice.payment?.installments || []).reduce((sum, p) => sum + (p.installmentAmount || 0), 0)
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Received</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      (selectedInvoice.payment?.installments || []).filter(p => p.status === 'Paid')
                        .reduce((sum, p) => sum + (p.installmentAmount || 0), 0)
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatCurrency(
                      (selectedInvoice.payment?.installments || []).filter(p => p.status === 'Pending')
                        .reduce((sum, p) => sum + (p.installmentAmount || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Tracking Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your invoices, payments, and financial performance</p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              {/* Date Range Filter */}
              <div className="flex gap-2">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="month">Monthly View</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateRange === 'month' ? (
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="self-center text-gray-500">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'card' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
                    }`}
                >
                  <Grid className="w-4 h-4 inline mr-1" />
                  Card View
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
                    }`}
                >
                  <Table className="w-4 h-4 inline mr-1" />
                  Table View
                </button>
              </div>
            </div>

            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Billed Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalBilled)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Received Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalReceived)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.totalPending)}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Invoices ({invoices.length})</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Filtered by {dateRange === 'month' ? selectedMonth : `${startDate} - ${endDate}`}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invoices.map((invoice) => (
                  <InvoiceCard key={invoice.invoiceId} invoice={invoice} />
                ))}
              </div>
            ) : (
              <InvoiceTable />
            )}
          </>
        )}

        {invoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600">No invoices match the selected criteria.</p>
          </div>
        )}

        {/* Invoice Detail Modal */}
        <InvoiceDetailModal />
      </div>
    </div>
  );
};

export default InvoiceTrackingDashboard;
