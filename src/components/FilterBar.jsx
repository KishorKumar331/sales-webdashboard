import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, X, Calendar, MapPin, DollarSign, Users, ChevronDown } from 'lucide-react';

const FilterBar = ({ data, onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    destination: '',
    minBudget: '',
    maxBudget: '',
    minTravelDate: '',
    maxTravelDate: '',
    minPax: '',
    maxPax: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [portalNode, setPortalNode] = useState(null);

  useEffect(() => {
    // Find the portal node after the component mounts
    const node = document.getElementById('navbar-filter-portal');
    if (node) {
      setPortalNode(node);
    } else {
      // Retry in case it's rendered slightly later
      const timeout = setTimeout(() => {
        const retryNode = document.getElementById('navbar-filter-portal');
        if (retryNode) setPortalNode(retryNode);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Extract unique destinations for autocomplete
  const destinations = useMemo(() => {
    const uniqueDestinations = [...new Set(data?.map(item => item.destination || item['Client-Destination'])?.filter(Boolean) || [])];
    return uniqueDestinations.sort();
  }, [data]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      destination: '',
      minBudget: '',
      maxBudget: '',
      minTravelDate: '',
      maxTravelDate: '',
      minPax: '',
      maxPax: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '');
  }, [filters]);

  const content = (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full relative z-[60]">
      {/* Search input */}
      <div className="relative flex-1 max-w-md w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-white/70" />
        </div>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search by name, trip ID, email, or phone..."
          className="block w-full pl-11 pr-4 py-2.5 bg-white/20 border border-white/10 rounded-full text-white placeholder-white/70 focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-inner"
        />
      </div>

      {/* Quick filters */}
      <div className="flex items-center gap-2">
        {/* Destination filter */}
        <div className="relative">
          <select
            value={filters.destination}
            onChange={(e) => handleFilterChange('destination', e.target.value)}
            className="appearance-none bg-white/20 border border-white/10 rounded-full px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-white/50 transition-all duration-200 [&>option]:text-gray-900 cursor-pointer shadow-sm"
          >
            <option value="">All Destinations</option>
            {destinations.map(dest => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
        </div>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border shadow-sm ${showAdvanced || hasActiveFilters
            ? 'bg-white/30 text-white border-white/40 shadow-inner'
            : 'bg-white/20 text-white border-white/10 hover:bg-white/30 hover:border-white/30'
            }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full border border-white/30">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-red-500/80 text-white border border-red-400/50 hover:bg-red-500 transition-all duration-200 shadow-sm"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="absolute top-full left-0 mt-3 p-5 bg-white rounded-xl shadow-2xl border border-gray-100 z-[70] min-w-[max-content] w-full max-w-2xl transform origin-top animate-fade-in text-gray-800">
          <div className="flex gap-3">
            {/* Budget range */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign className="h-4 w-4 text-purple-500" />
                Budget Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                  placeholder="Min"
                  className="w-[80px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-700"
                />
                <input
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                  placeholder="Max"
                  className="w-[80px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-700"
                />
              </div>
            </div>

            {/* Travel date range */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="h-4 w-4 text-purple-500" />
                Travel Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.minTravelDate}
                  onChange={(e) => handleFilterChange('minTravelDate', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-700"
                />
                <input
                  type="date"
                  value={filters.maxTravelDate}
                  onChange={(e) => handleFilterChange('maxTravelDate', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-700"
                />
              </div>
            </div>

            {/* Pax range */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Users className="h-4 w-4 text-purple-500" />
                Pax Range (Adults)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPax}
                  onChange={(e) => handleFilterChange('minPax', e.target.value)}
                  placeholder="Min"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-700"
                />
                <input
                  type="number"
                  value={filters.maxPax}
                  onChange={(e) => handleFilterChange('maxPax', e.target.value)}
                  placeholder="Max"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If portalNode exists, render into it. Otherwise, return null to avoid flashing wrong styles or render fallback.
  if (portalNode) {
    return createPortal(content, portalNode);
  }

  // Fallback while waiting for portal node (prevents error and ensures it appears ASAP)
  return null;
};

export default FilterBar;
