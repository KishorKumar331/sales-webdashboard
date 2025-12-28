import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";
import ConvertedCards from "../components/cards/ConvertedCard";
import {useUserProfile} from "../hooks/useUserProfile";

export default function Converted() {
  const scrollRef = useRef(null);
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
      if (!user?.FullName) return [];

      mode === "initial" ? setLoading(true) : setRefreshing(true);

      try {
        setError(null);

        const url = `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote?SalesPersonUid=${user.FullName}&SalesStatus=Converted`;

        const response = await fetch(url, {
          signal,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const json = await response.json();
        const parsed = parseLeads(json);

        setLeads(Array.isArray(parsed) ? parsed : []);
        return parsed;
      } catch (err) {
        if (err?.name === "AbortError") return [];

        console.error("❌ fetchLeads error:", err);
        setError(err.message || "Failed to fetch leads");
        setLeads([]);
        throw err;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [parseLeads, user]
  );

  // Replace useFocusEffect → useEffect
  useEffect(() => {
    if (!user?.FullName) return;

    const controller = new AbortController();
    fetchLeads("initial", controller.signal).catch(console.error);

    return () => controller.abort();
  }, [fetchLeads, user?.FullName]);

  const onRefresh = useCallback(() => fetchLeads("refresh"), [fetchLeads]);

  const renderLeads = useMemo(
    () =>
      leads.map((item, index) => (
        <ConvertedCards
          key={item?.id ?? item?._id ?? index}
          data={item}
          onStatusChange={fetchLeads}
        />
      )),
    [leads, fetchLeads]
  );

  return (
    <div className="min-h-screen bg-gray-50">
   
      {/* LOADING */}
      {loading || userLoading ? (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="animate-spin h-10 w-10 border-b-2 border-purple-600 rounded-full" />
          <p className="mt-4 text-gray-500">Loading leads...</p>
        </div>
      ) : error ? (
        /* ERROR */
        <div className="flex flex-col items-center justify-center h-[70vh] px-6">
          <AlertCircle size={64} className="text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            Error Loading Leads
          </h2>
          <p className="mt-2 text-sm text-gray-500 text-center">
            {error}
          </p>
          <button
            onClick={() => fetchLeads("initial")}
            className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      ) : leads.length === 0 ? (
        /* EMPTY */
        <div className="flex flex-col items-center justify-center h-[70vh] px-6">
          <FileText size={64} className="text-gray-400" />
          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            No Leads Found
          </h2>
          <p className="mt-2 text-sm text-gray-500 text-center">
            You haven't created any leads yet.
          </p>
          <button
            onClick={onRefresh}
            className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      ) : (
        /* LIST */
        <div
          ref={scrollRef}
          className="max-w-7xl mx-auto px-4 py-6 space-y-4"
        >
          {renderLeads}

          {refreshing && (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-6 w-6 border-b-2 border-purple-600 rounded-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
