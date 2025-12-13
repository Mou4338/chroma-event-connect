import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Users, MapPin, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { events, categories } from '@/data/mockData';
import { cn } from '@/lib/utils';

const filters = ['All', 'Popular', 'Recent', 'Upcoming'];

const Events = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);

  const filteredEvents = events.filter((event) => {
    if (selectedCategory) {
      return event.category.toLowerCase() === selectedCategory;
    }
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">Discover Events</h1>

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
        {!selectedCategory && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
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
        {selectedCategory && (
          <>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-muted-foreground"
              >
                ← Back to Categories
              </Button>
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
                          {event.rating}
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
                          {event.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button size="sm" variant="gradient" className="h-8">
                          Register
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Events;
