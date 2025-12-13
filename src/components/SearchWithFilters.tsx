import { useState } from 'react';
import { Search, Filter, X, Calendar, MapPin, Tag, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  category: string;
  dateRange: string;
  sortBy: string;
}

interface SearchWithFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
}

const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Business', 'Creative'];
const dateRanges = ['Any Time', 'Today', 'This Week', 'This Month', 'Upcoming'];
const sortOptions = ['Relevance', 'Date', 'Rating', 'Popularity'];

export const SearchWithFilters = ({ onSearch, placeholder = "Search events..." }: SearchWithFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'All',
    dateRange: 'Any Time',
    sortBy: 'Relevance',
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = { query: '', category: 'All', dateRange: 'Any Time', sortBy: 'Relevance' };
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const activeFiltersCount = [
    filters.category !== 'All',
    filters.dateRange !== 'Any Time',
    filters.sortBy !== 'Relevance',
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="pl-10 h-11 bg-muted/50"
          />
          {filters.query && (
            <button
              onClick={() => handleFilterChange('query', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'gradient' : 'glass'}
          size="icon"
          className="h-11 w-11 relative"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange rounded-full text-[10px] text-primary-foreground flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card p-4 space-y-4 animate-slide-up">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filters.category === cat ? 'gradient' : 'glass'}
                  size="sm"
                  onClick={() => handleFilterChange('category', cat)}
                  className="h-8"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-secondary" />
              Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              {dateRanges.map((range) => (
                <Button
                  key={range}
                  variant={filters.dateRange === range ? 'gradient' : 'glass'}
                  size="sm"
                  onClick={() => handleFilterChange('dateRange', range)}
                  className="h-8"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort By Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4 text-accent" />
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option}
                  variant={filters.sortBy === option ? 'gradient' : 'glass'}
                  size="sm"
                  onClick={() => handleFilterChange('sortBy', option)}
                  className="h-8"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-muted-foreground">
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
