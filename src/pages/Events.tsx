import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Users, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { fetchEvents, fetchCategories, searchEvents, fetchEventsByCategory } from '@/lib/database';
import { cn } from '@/lib/utils';

const filters = ['All', 'Popular', 'Recent', 'Upcoming'];

interface DbEvent {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  poster: string;
  venue: string;
  date: string;
  time: string;
  tags: string[];
  rating: number;
  rating_count: number;
  registrations: number;
  society: string;
  categories?: { name: string; icon: string } | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const Events = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const categoryParam = searchParams.get('category');
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [eventsData, categoriesData] = await Promise.all([
          fetchEvents(),
          fetchCategories()
        ]);
        setEvents(eventsData || []);
        setCategories(categoriesData || []);
        
        // Handle category from URL params
        if (categoryParam) {
          const cat = categoriesData?.find(c => c.name.toLowerCase() === categoryParam);
          if (cat) setSelectedCategory(cat.id);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [categoryParam]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery) {
        setLoading(true);
        try {
          const results = await searchEvents(searchQuery);
          setEvents(results || []);
        } catch (error) {
          console.error('Error searching:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    performSearch();
  }, [searchQuery]);

  const filteredEvents = events.filter((event) => {
    if (selectedCategory) {
      return event.category_id === selectedCategory;
    }
    return true;
  }).sort((a, b) => {
    switch (activeFilter) {
      case 'Popular':
        return b.registrations - a.registrations;
      case 'Rating':
        return b.rating - a.rating;
      case 'Recent':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'Upcoming':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      default:
        return 0;
    }
  });

  // Count events per category
  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    count: events.filter(e => e.category_id === cat.id).length
  }));

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">
          {searchQuery ? `Search: "${searchQuery}"` : 'Discover Events'}
        </h1>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'gradient' : 'glass'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="flex-shrink-0"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Categories Grid */}
        {!selectedCategory && !searchQuery && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categoriesWithCount.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="glass-card p-6 text-center hover:shadow-elevated transition-all duration-300 group"
                >
                  <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count} events</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Events List */}
        {(selectedCategory || searchQuery) && (
          <>
            <div className="flex items-center justify-between">
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="text-muted-foreground"
                >
                  ← Back to Categories
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                {filteredEvents.length} events found
              </span>
            </div>

            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="glass-card overflow-hidden flex group hover:shadow-elevated transition-all duration-300"
                >
                  <div className="w-28 sm:w-36 h-36 flex-shrink-0 overflow-hidden">
                    <img
                      src={event.poster}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                        <div className="flex items-center gap-1 text-xs bg-card px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 text-orange fill-orange" />
                          {event.rating} ({event.rating_count})
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.society}</p>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {event.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {event.date}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {event.tags?.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> {event.registrations}
                          </span>
                          <Button size="sm" variant="gradient" className="h-8">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Show all events if no category selected and no search */}
        {!selectedCategory && !searchQuery && (
          <section>
            <h2 className="text-lg font-semibold mb-4">All Events ({events.length})</h2>
            <div className="space-y-4">
              {filteredEvents.slice(0, 10).map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="glass-card overflow-hidden flex group hover:shadow-elevated transition-all duration-300"
                >
                  <div className="w-28 sm:w-36 h-36 flex-shrink-0 overflow-hidden">
                    <img
                      src={event.poster}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                        <div className="flex items-center gap-1 text-xs bg-card px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 text-orange fill-orange" />
                          {event.rating} ({event.rating_count})
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.society}</p>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {event.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {event.date}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {event.tags?.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> {event.registrations}
                          </span>
                          <Button size="sm" variant="gradient" className="h-8">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default Events;
