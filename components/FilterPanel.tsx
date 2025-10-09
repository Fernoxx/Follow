import { Search, Filter, X } from 'lucide-react'
import { useState } from 'react'

interface FilterOptions {
  showNotFollowingBack: boolean
  showLowNeynarScore: boolean
  neynarScoreThreshold: number
  showInactiveUsers: boolean
  inactiveMonths: number
  searchQuery: string
}

interface FilterPanelProps {
  filters: FilterOptions
  onFilterChange: (filters: Partial<FilterOptions>) => void
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchQuery: e.target.value })
  }

  const handleToggleFilter = (filterKey: keyof FilterOptions) => {
    onFilterChange({ [filterKey]: !filters[filterKey] })
  }

  const handleNeynarScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ neynarScoreThreshold: parseFloat(e.target.value) })
  }

  const handleInactiveMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ inactiveMonths: parseInt(e.target.value) })
  }

  const clearAllFilters = () => {
    onFilterChange({
      showNotFollowingBack: false,
      showLowNeynarScore: false,
      neynarScoreThreshold: 0.5,
      showInactiveUsers: false,
      inactiveMonths: 2,
      searchQuery: ''
    })
  }

  const activeFiltersCount = [
    filters.showNotFollowingBack,
    filters.showLowNeynarScore,
    filters.showInactiveUsers,
    filters.searchQuery
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by username or display name..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filter Options */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          {/* Not Following Back Filter */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Show users who don't follow you back
              </label>
              <p className="text-sm text-gray-500">
                Only show users you follow who don't follow you back
              </p>
            </div>
            <button
              onClick={() => handleToggleFilter('showNotFollowingBack')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                filters.showNotFollowingBack ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  filters.showNotFollowingBack ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Low Neynar Score Filter */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Show users with low Neynar score
              </label>
              <p className="text-sm text-gray-500">
                Show users with Neynar score below threshold
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.neynarScoreThreshold}
                  onChange={handleNeynarScoreChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 w-12">
                  {filters.neynarScoreThreshold.toFixed(1)}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleToggleFilter('showLowNeynarScore')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4 ${
                filters.showLowNeynarScore ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  filters.showLowNeynarScore ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Inactive Users Filter */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Show inactive users
              </label>
              <p className="text-sm text-gray-500">
                Show users who haven't posted in the specified time period
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={filters.inactiveMonths}
                  onChange={handleInactiveMonthsChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 w-20">
                  {filters.inactiveMonths} month{filters.inactiveMonths !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleToggleFilter('showInactiveUsers')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4 ${
                filters.showInactiveUsers ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  filters.showInactiveUsers ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}