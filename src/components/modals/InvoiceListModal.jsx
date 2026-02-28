


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import PdfPreviewModal from "./PdfPreviewModal";

export default function InvoiceListModal({
  visible,
  onClose,
  onCreateNew,
  data,
}) {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfHtml, setPdfHtml] = useState(null);

  const API_URL =
    "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html";

  useEffect(() => {
    if (visible && data?.TripId) {
      fetchInvoices();
    }
  }, [visible, data?.TripId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (data?.TripId) params.append("tripId", data.TripId);
      if (data?.invoiceId) params.append("invoiceId", data.invoiceId);

      const response = await fetch(
        `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/invoice-management/invoice?${params.toString()}`
      );

      if (!response.ok) throw new Error("Failed to fetch invoices");

      const result = await response.json();
      setInvoices(Array.isArray(result) ? result : [result]);
    } catch (err) {
      setError(err.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInvoice = ({invoice,data}) => {
    console.log("Invoice data being passed to edit:", data);
    onClose();
    navigate("/invoices/create", {
      state: {
        editData: invoice,
        tripId: invoice.tripId,
        isEdit: true,
        tripData:data

      },
    });
  };

 


    const handleShareInvoice = async (invoice) => {
    try {
      const response = await axios.post(API_URL, {
        type: "invoice",
        mode: "html",
        tripId: data?.TripId,
        invoiceId: invoice?.invoiceId || invoice?.TripId,
        templateName: "invoiceip.hbs",
      });

      if (!response.data) {
        throw new Error("HTML not returned");
      }

      setPdfHtml(response.data);
      setShowPdfModal(true);
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Failed to load preview");
    }
  };

  const generateInvoiceHtml = (invoice) => {
    const total =
      (invoice.pricing?.totalAmount || 0) +
      (invoice.pricing?.gstAmount || 0) +
      (invoice.pricing?.tcsAmount || 0);

    return `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial; padding: 40px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f3f4f6; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>INVOICE</h1>
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Status:</strong> ${invoice.invoiceStatus}</p>

          <h3>Customer</h3>
          <p>${invoice.customer?.name}</p>
          <p>${invoice.customer?.email}</p>
          <p>${invoice.customer?.contact}</p>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Package Amount</td>
                <td>₹${invoice.pricing?.totalAmount?.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td>GST</td>
                <td>₹${invoice.pricing?.gstAmount?.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td>TCS</td>
                <td>₹${invoice.pricing?.tcsAmount?.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total: ₹${total.toLocaleString("en-IN")}
          </div>

          <br/>
          <button onclick="window.print()">Print Invoice</button>
        </body>
      </html>
    `;
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[800px] max-h-[90vh] rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 flex justify-between">
          <h2 className="text-lg font-bold">Invoice Management</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* Create Button */}
         { error && 
         (  <button
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          >
            + Create New Invoice
          </button>)
       
}
          {loading && <p>Loading invoices...</p>}

          {error && (
            <div className="text-red-500">
              {error}
              <button
                onClick={fetchInvoices}
                className="ml-3 text-purple-600 underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && invoices.length === 0 && (
            <p className="text-gray-500">No invoices found.</p>
          )}

          {invoices.map((invoice) => (
            <div
              key={invoice.invoiceId}
              className="border rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between">
                <h3 className="text-purple-600 font-bold">
                  {invoice.invoiceNumber}
                </h3>
          
              </div>

              <p className="font-semibold mt-2">
                ₹{invoice.pricing?.totalAmount?.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-gray-500">
                {invoice.customer?.name} • {invoice.destination}
              </p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleEditInvoice({invoice,data})}
                  className="bg-blue-100 px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleShareInvoice(invoice)}
                  className="bg-green-100 px-3 py-1 rounded"
                >
                  Preview / Print
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* PDF Preview Modal */}
      <PdfPreviewModal
        visible={showPdfModal}
        pdfHtml={pdfHtml}
          onShare={() => {
          setShowPdfModal(false);
          setPdfHtml(null);
        }}
        clientName="InvoicePdf"
        onClose={() => {
          setShowPdfModal(false);
          setPdfHtml(null);
        }}
      />
    </div>
  );
}
