import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Users, MessageSquare, ChevronRight, QrCode, Sparkles, Brain, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/MainLayout';
import { fetchEventById, fetchEvents } from '@/lib/database';
import { getSimilarEvents, useAISuggestions } from '@/hooks/useAISuggestions';
import { toast } from 'sonner';

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

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<DbEvent | null>(null);
  const [allEvents, setAllEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  
  const { registerForEvent, rateEvent, submitFeedback } = useAISuggestions();

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [eventData, eventsData] = await Promise.all([
          fetchEventById(id),
          fetchEvents()
        ]);
        setEvent(eventData);
        setAllEvents(eventsData || []);
      } catch (error) {
        console.error('Error loading event:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvent();
  }, [id]);

  const similarEvents = event ? getSimilarEvents(event, allEvents, 4) : [];

  const handleRegister = () => {
    if (!event) return;
    setIsRegistered(true);
    registerForEvent(event.id);
    toast.success('Successfully registered for the event!');
  };

  const handleSubmitReview = () => {
    if (!event) return;
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    rateEvent(event.id, userRating);
    submitFeedback(event.id, userRating);
    toast.success('Review submitted! This helps improve your recommendations.');
    setComment('');
    setUserRating(0);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Event not found</h2>
          <Link to="/events" className="text-primary hover:underline mt-2 inline-block">
            Browse all events
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto particles-bg">
        {/* Banner */}
        <div className="relative -mx-4 -mt-4 sm:mx-0 sm:rounded-2xl overflow-hidden">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-56 sm:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <span className="px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
              {event.categories?.name || 'Event'}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium">
                <Star className="h-3 w-3 text-orange fill-orange" />
                {event.rating || 0}
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium">
                <Users className="h-3 w-3 text-primary" />
                {event.rating_count || 0} rated
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="glass-card p-6 space-y-4 animated-border">
          <h1 className="text-2xl font-bold gradient-text">{event.title}</h1>
          <p className="text-muted-foreground">{event.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="text-sm font-medium">{event.date} • {event.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="text-sm font-medium">{event.venue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registrations</p>
                <p className="text-sm font-medium">{event.registrations || 0} students</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Society</p>
                <p className="text-sm font-medium">{event.society}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {(event.tags || []).map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Register Button */}
        <Button 
          variant="gradient" 
          size="xl" 
          className="w-full neon-glow"
          onClick={handleRegister}
          disabled={isRegistered}
        >
          {isRegistered ? '✓ Registered Successfully' : 'Register Now'}
        </Button>

        {/* QR Code */}
        {isRegistered && (
          <div className="glass-card p-6 text-center animated-border">
            <div className="w-32 h-32 mx-auto bg-muted/50 rounded-xl flex items-center justify-center mb-4">
              <QrCode className="h-16 w-16 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Scan this QR code at the venue</p>
          </div>
        )}

        {/* Rating Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Rate This Event</h2>
            <Sparkles className="h-4 w-4 text-orange animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground -mt-2">Your rating helps personalize your recommendations</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setUserRating(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${star <= userRating ? 'text-orange fill-orange' : 'text-muted-foreground hover:text-orange/50'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            Reviews & Comments
          </h2>
          
          <div className="space-y-3">
            {[1, 2].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-xs font-medium">
                    S{i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Student {i + 1}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'text-orange fill-orange' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Great event! Really enjoyed the sessions and learned a lot.</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none bg-muted/30"
            />
            <Button onClick={handleSubmitReview} className="w-full" variant="secondary">
              Submit Review
            </Button>
          </div>
        </div>

        {/* Join Group Button */}
        <Button variant="glass" size="lg" className="w-full">
          <MessageSquare className="h-5 w-5 mr-2" />
          Join Event Group
        </Button>

        {/* AI-Powered Similar Events */}
        {similarEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">AI Suggests</h2>
                <Sparkles className="h-4 w-4 text-orange animate-pulse" />
              </div>
              <Link to="/events" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mb-3 -mt-2">Events similar to {event.title}</p>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {similarEvents.map((evt, index) => (
                <Link
                  key={evt.id}
                  to={`/events/${evt.id}`}
                  className="flex-shrink-0 w-48 glass-card overflow-hidden group hover:shadow-elevated transition-all duration-300 ai-sparkle"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={evt.poster}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-[10px] font-medium text-primary-foreground flex items-center gap-1">
                        <Sparkles className="h-2 w-2" />
                        Best Match
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">{evt.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{evt.date}</p>
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

export default EventDetails;