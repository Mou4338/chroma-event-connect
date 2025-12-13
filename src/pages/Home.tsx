import { Link } from 'react-router-dom';
import { ChevronRight, AlertTriangle, Star, Users, MapPin, Clock, Sparkles, Brain, TrendingUp, Calendar, Timer, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { events, categories } from '@/data/mockData';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { cn } from '@/lib/utils';
import { format, differenceInDays, differenceInHours, isPast, isFuture, isToday } from 'date-fns';

// Mock registered events data
const registeredEvents = [
  { eventId: '1', registeredAt: '2024-03-10', status: 'upcoming' as const },
  { eventId: '2', registeredAt: '2024-03-08', status: 'upcoming' as const },
  { eventId: '5', registeredAt: '2024-03-01', status: 'upcoming' as const },
];

const Home = () => {
  const { user } = useAuth();
  const { suggestions, loading: aiLoading, submitFeedback } = useAISuggestions(4);

  const popularEvents = events.slice(0, 6);

  // Get registered event details
  const myRegisteredEvents = registeredEvents.map(reg => {
    const event = events.find(e => e.id === reg.eventId);
    if (!event) return null;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const daysUntil = differenceInDays(eventDate, now);
    const hoursUntil = differenceInHours(eventDate, now);
    
    let timeStatus = '';
    let urgency: 'high' | 'medium' | 'low' = 'low';
    
    if (isToday(eventDate)) {
      timeStatus = `Today at ${event.time}`;
      urgency = 'high';
    } else if (daysUntil === 1) {
      timeStatus = `Tomorrow at ${event.time}`;
      urgency = 'high';
    } else if (daysUntil <= 3) {
      timeStatus = `In ${daysUntil} days`;
      urgency = 'medium';
    } else if (daysUntil <= 7) {
      timeStatus = `In ${daysUntil} days`;
      urgency = 'low';
    } else {
      timeStatus = format(eventDate, 'MMM d, yyyy');
      urgency = 'low';
    }
    
    return {
      ...event,
      registeredAt: reg.registeredAt,
      status: reg.status,
      timeStatus,
      urgency,
      daysUntil,
    };
  }).filter(Boolean);

  const handleFeedback = (score: number) => {
    submitFeedback('1', score);
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in particles-bg">
        {/* Dashboard Card */}
        <div className="glass-card p-6 animated-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-xl shadow-glow animate-pulse-slow">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{user?.username || 'Student'}</h2>
                <p className="text-sm text-muted-foreground">{user?.branch} • {user?.year}</p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange/20 to-primary/20 text-sm font-semibold flex items-center gap-1.5 animate-glow">
                <TrendingUp className="h-4 w-4 text-orange" />
                {user?.points || 0} pts
              </div>
            </div>

            {/* Registered Events Tracking */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm">My Registered Events</h3>
                </div>
                <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-primary/10">
                  {myRegisteredEvents.length} events
                </span>
              </div>
              
              <div className="space-y-3">
                {myRegisteredEvents.slice(0, 3).map((event) => {
                  const eventData = events.find(e => e.id === event!.id);
                  const hasUpdates = eventData?.updates && eventData.updates.length > 0;
                  
                  return (
                    <Link
                      key={event!.id}
                      to={`/events/${event!.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 group relative"
                    >
                      {hasUpdates && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange rounded-full animate-pulse" />
                      )}
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={event!.poster} 
                          alt={event!.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event!.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event!.venue}</span>
                        </div>
                        {hasUpdates && (
                          <p className="text-[10px] text-orange mt-1 truncate">
                            📢 {eventData?.updates?.[0].message}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                          event!.urgency === 'high' && "bg-orange/20 text-orange",
                          event!.urgency === 'medium' && "bg-blue/20 text-blue",
                          event!.urgency === 'low' && "bg-muted text-muted-foreground"
                        )}>
                          <Timer className="h-3 w-3" />
                          {event!.timeStatus}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Star className="h-2.5 w-2.5 text-orange fill-orange" />
                          {eventData?.rating} ({eventData?.ratingCount || 0})
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {myRegisteredEvents.length > 3 && (
                <Link 
                  to="/profile?tab=events" 
                  className="text-xs text-primary hover:underline flex items-center justify-center gap-1 mt-3"
                >
                  View all {myRegisteredEvents.length} events <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {/* Event Clash Alert */}
            <div className="mt-4 p-3 rounded-xl bg-orange/10 border border-orange/20 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Event Clash Alert!</p>
                <p className="text-xs text-muted-foreground">TechFest & Cultural Night on same day</p>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium gradient-text">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </div>

        {/* AI-Powered Suggestions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">AI Picks For You</h2>
              <Sparkles className="h-4 w-4 text-orange animate-pulse" />
            </div>
            <Link to="/events" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mb-4 -mt-2">
            Based on your interests & positive feedback
          </p>
          
          {aiLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-72 h-64 glass-card animate-pulse">
                  <div className="h-40 bg-muted/50 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted/50 rounded w-3/4" />
                    <div className="h-3 bg-muted/50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {suggestions.map((event, index) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className={cn(
                    "flex-shrink-0 w-72 glass-card overflow-hidden group hover:shadow-elevated transition-all duration-300 ai-sparkle",
                    index === 0 && "neon-glow"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.poster}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 text-orange fill-orange" />
                      {event.rating}
                    </div>
                    {index === 0 && (
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-medium text-primary-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Top Pick
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {event.date} • {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.venue}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Explore Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                to={`/events?category=${cat.id}`}
                className="glass-card p-4 text-center hover:shadow-elevated transition-all duration-300 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.name}</span>
                <span className="block text-[10px] text-muted-foreground mt-1">{cat.count} events</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Events Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Popular Events</h2>
            <Link to="/events" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularEvents.map((event, index) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="glass-card overflow-hidden flex group hover:shadow-elevated transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-32 h-32 flex-shrink-0 overflow-hidden relative">
                  <img
                    src={event.poster}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/50" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{event.society}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {event.registrations}
                    </div>
                    <div className="flex gap-1">
                      {event.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Feedback CTA */}
        <div className="glass-card p-4 text-center animated-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">Help us improve your recommendations!</p>
          </div>
          <div className="flex justify-center gap-3">
            {[
              { emoji: '😞', score: 1 },
              { emoji: '😐', score: 2 },
              { emoji: '😊', score: 4 },
              { emoji: '😍', score: 5 },
            ].map(({ emoji, score }) => (
              <button
                key={score}
                onClick={() => handleFeedback(score)}
                className="text-2xl hover:scale-125 transition-transform p-2 rounded-full hover:bg-muted/50"
              >
                {emoji}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Your feedback trains our AI to suggest better events</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
