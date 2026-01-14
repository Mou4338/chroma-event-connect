import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Trophy, Menu, X, SlidersHorizontal, Tag, Filter, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';
import { CalendarDropdown } from './CalendarDropdown';

interface SearchFilters {
  query: string;
  category: string;
  dateRange: string;
  sortBy: string;
}

const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Business', 'Creative'];
const dateRanges = ['Any Time', 'Today', 'This Week', 'This Month'];
const sortOptions = ['Relevance', 'Date', 'Rating', 'Popularity'];

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/events', label: 'Events' },
  { path: '/recruitment', label: 'Recruitment' },
  { path: '/announcements', label: 'Announcements' },
  { path: '/organizer', label: 'Organizer' },
  { path: '/profile', label: 'Profile' },
];

export const TopNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'All',
    dateRange: 'Any Time',
    sortBy: 'Relevance',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.category !== 'All') params.set('category', filters.category.toLowerCase());
    if (filters.dateRange !== 'Any Time') params.set('date', filters.dateRange.toLowerCase().replace(' ', '-'));
    if (filters.sortBy !== 'Relevance') params.set('sort', filters.sortBy.toLowerCase());
    navigate(`/events?${params.toString()}`);
  };

  const activeFiltersCount = [
    filters.category !== 'All',
    filters.dateRange !== 'Any Time',
    filters.sortBy !== 'Relevance',
  ].filter(Boolean).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto">
        {/* Main Nav */}
        <nav className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">KE</span>
            </div>
            <span className="font-semibold text-lg gradient-text hidden sm:inline">KIIT Events</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="hidden sm:flex items-center gap-2">
              <NotificationDropdown />
              <CalendarDropdown />
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-orange/20 to-primary/20">
                <Trophy className="h-4 w-4 text-orange" />
                <span className="text-sm font-semibold">{user?.points || 0}</span>
              </div>
            </div>

            <Link to="/profile">
              <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </nav>

        {/* Search Bar with Filters */}
        <div className="px-4 pb-3">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events, societies, announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-muted/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                type="button"
                variant={showFilters ? 'gradient' : 'glass'}
                size="icon"
                className="h-10 w-10 relative flex-shrink-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange rounded-full text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </form>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="max-w-2xl mx-auto mt-3 glass-card p-4 space-y-4 animate-slide-up">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={filters.category === cat ? 'gradient' : 'glass'}
                      size="sm"
                      onClick={() => setFilters({ ...filters, category: cat })}
                      className="h-7 text-xs"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary" />
                  Date Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {dateRanges.map((range) => (
                    <Button
                      key={range}
                      type="button"
                      variant={filters.dateRange === range ? 'gradient' : 'glass'}
                      size="sm"
                      onClick={() => setFilters({ ...filters, dateRange: range })}
                      className="h-7 text-xs"
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4 text-accent" />
                  Sort By
                </label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={filters.sortBy === option ? 'gradient' : 'glass'}
                      size="sm"
                      onClick={() => setFilters({ ...filters, sortBy: option })}
                      className="h-7 text-xs"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              
              {activeFiltersCount > 0 && (
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilters({ query: '', category: 'All', dateRange: 'Any Time', sortBy: 'Relevance' })}
                  className="w-full text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border/50 animate-slide-up">
          <div className="container mx-auto py-4 px-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
