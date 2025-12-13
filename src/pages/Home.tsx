import { Link } from 'react-router-dom';
import { ChevronRight, AlertTriangle, Star, Users, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { events, categories } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Home = () => {
  const { user } = useAuth();

  const suggestedEvents = events.slice(0, 4);
  const popularEvents = events.slice(0, 6);

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Dashboard Card */}
        <div className="glass-card p-6 gradient-border">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-xl shadow-glow">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{user?.username || 'Student'}</h2>
              <p className="text-sm text-muted-foreground">{user?.branch} • {user?.year}</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-orange/10 border border-orange/20 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Event Clash Alert!</p>
              <p className="text-xs text-muted-foreground">TechFest & Cultural Night on same day</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="font-medium">75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </div>

        {/* Suggested Events Carousel */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Suggested For You</h2>
            <Link to="/events" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {suggestedEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex-shrink-0 w-72 glass-card overflow-hidden group hover:shadow-elevated transition-all duration-300"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={event.poster}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 text-orange fill-orange" />
                    {event.rating}
                  </div>
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
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Explore Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/events?category=${cat.id}`}
                className="glass-card p-4 text-center hover:shadow-elevated transition-all duration-300 group"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.name}</span>
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
            {popularEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="glass-card overflow-hidden flex group hover:shadow-elevated transition-all duration-300"
              >
                <div className="w-32 h-32 flex-shrink-0 overflow-hidden">
                  <img
                    src={event.poster}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
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
        <div className="glass-card p-4 text-center gradient-border">
          <p className="text-sm text-muted-foreground mb-2">How's your experience?</p>
          <div className="flex justify-center gap-2">
            {['😞', '😐', '😊', '😍'].map((emoji, i) => (
              <button
                key={i}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
