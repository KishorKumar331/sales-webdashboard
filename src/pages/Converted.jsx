import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { AlertCircle, FileText, RefreshCw, Filter } from "lucide-react";
import ConvertedCards from "../components/cards/ConvertedCard";
import FilterBar from "../components/FilterBar";
import {useAuth} from "../hooks/useAuth";

export default function Converted() {
  const scrollRef = useRef(null);
const {user} = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({});

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

        const url = `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote?salesPersonUid=${user.Email}&latestStatus=Converted&case=maxcase`

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

  // Apply frontend filters
  const filteredLeads = useMemo(() => {
    if (!leads.length) return leads;

    return leads.filter(lead => {
      // Search filter (name, trip ID, email, phone)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          lead.clientName || lead['Client-Name'] || '',
          lead.TripId?.toString() || '',
          lead.clientEmail || lead['Client-Email'] || '',
          lead.clientContact || lead['Client-Contact'] || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Destination filter
      if (filters.destination && lead.destination !== filters.destination) {
        return false;
      }

      // Budget range filter
      const budget = parseFloat(lead.budget) || 0;
      if (filters.minBudget && budget < parseFloat(filters.minBudget)) {
        return false;
      }
      if (filters.maxBudget && budget > parseFloat(filters.maxBudget)) {
        return false;
      }

      // Travel date range filter
      if (filters.minTravelDate || filters.maxTravelDate) {
        const travelDate = new Date(lead.travelDate);
        if (!isNaN(travelDate.getTime())) {
          if (filters.minTravelDate && travelDate < new Date(filters.minTravelDate)) {
            return false;
          }
          if (filters.maxTravelDate && travelDate > new Date(filters.maxTravelDate)) {
            return false;
          }
        }
      }

      // Pax range filter
      const pax = parseInt(lead.pax) || 0;
      if (filters.minPax && pax < parseInt(filters.minPax)) {
        return false;
      }
      if (filters.maxPax && pax > parseInt(filters.maxPax)) {
        return false;
      }

      return true;
    });
  }, [leads, filters]);

  const renderLeads = useMemo(
    () =>
      filteredLeads.map((item, index) => (
        <ConvertedCards
          key={item?.id ?? item?._id ?? index}
          data={item}
          onStatusChange={fetchLeads}
        />
      )),
    [filteredLeads, fetchLeads]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Bar - Sticky */}
      {!loading && !error && leads.length > 0 && (
        <FilterBar 
          data={leads} 
          onFilterChange={setFilters}
        />
      )}
   
      {/* LOADING */}
      {loading ? (
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
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {filteredLeads.length === leads.length ? (
                <span>Showing all <span className="font-semibold text-gray-900">{leads.length}</span> leads</span>
              ) : (
                <span>
                  Showing <span className="font-semibold text-purple-600">{filteredLeads.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{leads.length}</span> leads
                </span>
              )}
            </div>
            {filteredLeads.length === 0 && Object.values(filters).some(v => v !== '') && (
              <button
                onClick={() => setFilters({})}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* No results for current filters */}
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 bg-white rounded-lg border border-gray-200">
              <Filter size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No leads match your filters</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Try adjusting your filter criteria to see more results
              </p>
              <button
                onClick={() => setFilters({})}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            renderLeads
          )}

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
