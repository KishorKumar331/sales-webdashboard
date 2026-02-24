import { useState, useMemo } from 'react';
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

  // Extract unique destinations for autocomplete
  const destinations = useMemo(() => {
    const uniqueDestinations = [...new Set(data?.map(item => item.destination)?.filter(Boolean) || [])];
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

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main search bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name, trip ID, email, or phone..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Quick filters */}
          <div className="flex items-center gap-2">
            {/* Destination filter */}
            <div className="relative">
              <select
                value={filters.destination}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Destinations</option>
                {destinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
              <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                showAdvanced || hasActiveFilters
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {Object.values(filters).filter(v => v !== '').length}
                </span>
              )}
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all duration-200"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Budget range */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  Budget Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minBudget}
                    onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filters.maxBudget}
                    onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Travel date range */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Travel Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.minTravelDate}
                    onChange={(e) => handleFilterChange('minTravelDate', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={filters.maxTravelDate}
                    onChange={(e) => handleFilterChange('maxTravelDate', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Pax range */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4 text-gray-400" />
                  Pax Range (Adults)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPax}
                    onChange={(e) => handleFilterChange('minPax', e.target.value)}
                    placeholder="Min"
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filters.maxPax}
                    onChange={(e) => handleFilterChange('maxPax', e.target.value)}
                    placeholder="Max"
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
