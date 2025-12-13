import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Users, MessageSquare, ChevronRight, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/MainLayout';
import { events } from '@/data/mockData';
import { toast } from 'sonner';

const EventDetails = () => {
  const { id } = useParams();
  const event = events.find((e) => e.id === id) || events[0];
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const similarEvents = events.filter((e) => e.category === event.category && e.id !== event.id).slice(0, 3);

  const handleRegister = () => {
    setIsRegistered(true);
    toast.success('Successfully registered for the event!');
  };

  const handleSubmitReview = () => {
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    toast.success('Review submitted!');
    setComment('');
    setUserRating(0);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        {/* Banner */}
        <div className="relative -mx-4 -mt-4 sm:mx-0 sm:rounded-2xl overflow-hidden">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-56 sm:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
              {event.category}
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div className="glass-card p-6 space-y-4">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">{event.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="text-sm font-medium">{event.date} • {event.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="text-sm font-medium">{event.venue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registrations</p>
                <p className="text-sm font-medium">{event.registrations} students</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-orange" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="text-sm font-medium">{event.rating} / 5.0</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {event.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Register Button */}
        <Button 
          variant="gradient" 
          size="xl" 
          className="w-full"
          onClick={handleRegister}
          disabled={isRegistered}
        >
          {isRegistered ? '✓ Registered Successfully' : 'Register Now'}
        </Button>

        {/* QR Code */}
        {isRegistered && (
          <div className="glass-card p-6 text-center">
            <div className="w-32 h-32 mx-auto bg-muted rounded-xl flex items-center justify-center mb-4">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Scan this QR code at the venue</p>
          </div>
        )}

        {/* Rating Section */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold">Rate This Event</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setUserRating(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${star <= userRating ? 'text-orange fill-orange' : 'text-muted-foreground'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews & Comments
          </h2>
          
          <div className="space-y-3">
            {[1, 2].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full gradient-bg" />
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
              className="resize-none"
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

        {/* Similar Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Similar Events</h2>
            <Link to="/events" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {similarEvents.map((evt) => (
              <Link
                key={evt.id}
                to={`/events/${evt.id}`}
                className="flex-shrink-0 w-48 glass-card overflow-hidden group hover:shadow-elevated transition-all duration-300"
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={evt.poster}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">{evt.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{evt.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default EventDetails;
