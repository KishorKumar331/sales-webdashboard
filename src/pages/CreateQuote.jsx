import React, { useEffect, useRef, useState, useCallback } from "react";
import { AlertCircle, FileText } from "lucide-react";
import QuotationCards from "../components/cards/QuotationCards";
import { useUserProfile } from "../hooks/useUserProfile";

export default function CreateQuote() {
  const { user, loading: userLoading } = useUserProfile();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const parseLeads = useCallback((raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.leads)) return raw.leads;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, []);

  const fetchLeads = useCallback(
    async (mode = "initial", signal) => {
      if (!user?.FullName) return;

      mode === "initial" ? setLoading(true) : setRefreshing(true);

      try {
        setError(null);
        const url = `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote?SalesPersonUid=${user.FullName}&SalesStatus=LeadCreate`;

        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        setLeads(parseLeads(json));
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e.message || "Failed to fetch leads");
        setLeads([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [parseLeads, user]
  );

  useEffect(() => {
    if (!user?.FullName) return;
    const controller = new AbortController();
    fetchLeads("initial", controller.signal);
    return () => controller.abort();
  }, [fetchLeads, user]);

  return (
    <div className="min-h-screen bg-gray-50">
    

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
          <p className="mt-4 text-gray-500">Loading leads…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle size={64} className="text-red-500" />
          <h2 className="mt-4 text-lg font-semibold">Error Loading Leads</h2>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={() => fetchLeads("initial")}
            className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && leads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText size={64} className="text-gray-400" />
          <h2 className="mt-4 text-lg font-semibold">No Leads Found</h2>
          <p className="text-gray-500 mt-2">
            You haven’t created any leads yet.
          </p>
          <button
            onClick={() => fetchLeads("refresh")}
            className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>
      )}

      {/* List */}
      {!loading && !error && leads.length > 0 && (
        <div className="px-4 py-6 space-y-4">
          {leads.map((lead, idx) => (
            <QuotationCards key={idx} leadData={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
