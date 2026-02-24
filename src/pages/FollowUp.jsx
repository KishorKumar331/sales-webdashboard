
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import FollowUpCards from "../components/cards/FollowUpCards";
import FilterBar from "../components/FilterBar";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../hooks/useAuth";

export default function FollowUp() {
    const {user,loading } = useAuth();
  const [filters, setFilters] = useState({});

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery({
    enabled: !!user,
    queryKey: ["followup", user?.FullName],
    queryFn: async () => {
      const res = await axios.get(
        `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote?salesPersonUid=${user.Email}&latestStatus=Cold&case=maxcase`,
      );
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Apply frontend filters
  const filteredData = useMemo(() => {
    if (!data.length) return data;

    return data.filter(lead => {
      // Search filter (name, trip ID, email, phone)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          lead.clientName || '',
          lead.TripId?.toString() || '',
          lead.clientEmail || '',
          lead.clientContact || ''
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
  }, [data, filters]);

  // Loading state
  if (loading || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Filter Bar - Sticky */}
      {!loading && !isLoading && data.length > 0 && (
        <FilterBar 
          data={data} 
          onFilterChange={setFilters}
        />
      )}

      {/* Refresh Button */}
      <div className="w-full px-4 pt-6">
        <div className="flex justify-between items-center">
          {/* Results count */}
          <div className="text-sm text-gray-600">
            {filteredData.length === data.length ? (
              <span>Showing all <span className="font-semibold text-gray-900">{data.length}</span> follow-ups</span>
            ) : (
              <span>
                Showing <span className="font-semibold text-purple-600">{filteredData.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{data.length}</span> follow-ups
              </span>
            )}
          </div>
          
          <button
            onClick={refetch}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="w-full px-4 py-6 grid grid-cols-1 gap-6">
        {filteredData.length === 0 && data.length > 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-6 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No follow-ups match your filters</h3>
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
        ) : data.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No follow-ups found.
          </p>
        ) : (
          filteredData.map((item, index) => (
            <FollowUpCards
              key={item.TripId?.toString() || `lead-${index}`}
              data={item}
            />
          ))
        )}
      </div>
    </div>
  );
}
