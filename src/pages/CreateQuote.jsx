import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AlertCircle, FileText } from "lucide-react";
import QuotationCards from "../components/cards/QuotationCards";
import FilterBar from "../components/FilterBar";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../hooks/useAuth";

export default function CreateQuote() {
    const {user } = useAuth();

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
      if (!user?.FullName) return;

      mode === "initial" ? setLoading(true) : setRefreshing(true);

      try {
        setError(null);
        const url = `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote?salesPersonUid=${user.Email}&latestStatus=LeadCreate&case=maxcase`;

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

  // Apply frontend filters
  const filteredLeads = useMemo(() => {
    if (!leads.length) return leads;

    return leads.filter(lead => {
      // Search filter (name, trip ID, email, phone)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          lead['Client-Name'] || '',
          lead.TripId?.toString() || '',
          lead['Client-Email'] || '',
          lead['Client-Contact'] || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Destination filter
      if (filters.destination && lead['Client-Destination'] !== filters.destination) {
        return false;
      }

      // Budget range filter
      const budget = parseFloat(lead['Client-Budget']) || 0;
      if (filters.minBudget && budget < parseFloat(filters.minBudget)) {
        return false;
      }
      if (filters.maxBudget && budget > parseFloat(filters.maxBudget)) {
        return false;
      }

      // Travel date range filter
      if (filters.minTravelDate || filters.maxTravelDate) {
        const travelDate = new Date(lead['Client-TravelDate']);
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
      const pax = parseInt(lead['Client-Pax']) || 0;
      if (filters.minPax && pax < parseInt(filters.minPax)) {
        return false;
      }
      if (filters.maxPax && pax > parseInt(filters.maxPax)) {
        return false;
      }

      return true;
    });
  }, [leads, filters]);

  useEffect(() => {
    if (!user?.FullName) return;
    const controller = new AbortController();
    fetchLeads("initial", controller.signal);
    return () => controller.abort();
  }, [fetchLeads, user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Bar - Sticky */}
      {!loading  && !error && leads.length > 0 && (
        <FilterBar 
          data={leads} 
          onFilterChange={setFilters}
        />
      )}

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
            You haven't created any leads yet.
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
        <div className="px-4 py-6">
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
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
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
            <div className="space-y-4">
              {filteredLeads.map((lead, idx) => (
                <QuotationCards key={idx} leadData={lead} />
              ))}
            </div>
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
