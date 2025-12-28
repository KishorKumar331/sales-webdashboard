import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Pencil,
  Share2,
  FileText,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ------------------ MODAL ------------------ */

export default function InvoiceListModal({
  visible,
  onClose,
  onCreateNew,
  data,
}) {
  const router = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const latest = invoices[0];
  const previous = invoices.slice(1);

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

      const url = `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/invoice-management/invoice?${params}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch invoices");

      const json = await res.json();
      setInvoices(Array.isArray(json) ? json : [json]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleEditInvoice = (invoice) => {
    onClose();
    router(
      `/invoices/create?isEdit=true&tripId=${invoice.tripId}&initialData=${encodeURIComponent(
        JSON.stringify(invoice)
      )}`
    );
  };

  const handleShareInvoice = async (invoice) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: "Sharing invoice",
        });
      } else {
        window.alert("Sharing not supported on this browser");
      }
    } catch (err) {
      console.error(err);
      window.alert("Failed to share invoice");
    }
  };

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "partial":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-gray-50 w-full max-w-lg max-h-[90vh] rounded-2xl overflow-hidden shadow-xl">
        {/* HEADER */}
        <div className="bg-purple-600 p-4 pt-10 rounded-b-3xl flex justify-between items-center">
          <div>
            <h2 className="text-white text-xl font-bold">Journey Routers</h2>
            <p className="text-white/80 text-sm">Invoice Management</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 p-2 rounded-full"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!data?.invoiceId && (
            <button
              onClick={() => {
                onClose();
                setTimeout(onCreateNew, 100);
              }}
              className="w-full bg-green-500 text-white rounded-lg py-3 flex items-center justify-center mb-4"
            >
              <Plus size={18} className="mr-2" />
              Create New Invoice
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center py-10">
              <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full" />
              <p className="text-gray-600 mt-2">Loading invoices…</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <AlertCircle size={36} className="mx-auto text-red-500 mb-3" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchInvoices}
                className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && invoices.length === 0 && (
            <div className="text-center py-10">
              <Receipt size={56} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No invoices found</p>
            </div>
          )}

          {latest && renderInvoice(latest, true)}
          {previous.length > 0 &&
            previous.map((inv) => renderInvoice(inv))}
        </div>
      </div>
    </div>
  );

  function renderInvoice(invoice, latest = false) {
    return (
      <div
        key={invoice.invoiceId || invoice.invoiceNumber}
        className={`bg-white p-4 mb-4 rounded-xl ${
          latest ? "border border-purple-300" : ""
        }`}
      >
        {latest && (
          <p className="text-xs text-gray-500 mb-1 font-medium">
            LATEST INVOICE
          </p>
        )}

        <div className="flex justify-between items-center mb-2">
          <p className="text-purple-600 font-bold text-lg">
            {invoice.invoiceNumber || invoice.invoiceId}
          </p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
              invoice.invoiceStatus || invoice.Status
            )}`}
          >
            {invoice.invoiceStatus || invoice.Status || "Draft"}
          </span>
        </div>

        <p className="text-gray-900 font-semibold text-lg">
          ₹{invoice.pricing?.totalAmount?.toLocaleString("en-IN") || "0"}
        </p>

        <p className="text-gray-500 text-sm">
          Destination: {invoice.destination || "N/A"}
        </p>
        <p className="text-gray-500 text-xs">
          {invoice.customer?.name} • {invoice.customer?.contact}
        </p>

        <div className="flex justify-end gap-2 mt-3">
          <button
            className="bg-blue-100 p-2 rounded-full"
            onClick={() => handleEditInvoice(invoice)}
          >
            <Pencil size={16} className="text-blue-600" />
          </button>

          <button
            className="bg-green-100 p-2 rounded-full"
            onClick={() => handleShareInvoice(invoice)}
          >
            <Share2 size={16} className="text-green-600" />
          </button>

          <button
            className="bg-gray-100 p-2 rounded-full"
            onClick={() => {
              onClose();
              router.push(
                `/invoices/${invoice.invoiceId || invoice.invoiceNumber}`
              );
            }}
          >
            <FileText size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    );
  }
}
