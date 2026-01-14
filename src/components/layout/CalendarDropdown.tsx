import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRegistrations } from '@/lib/database';
import { isSameDay, parseISO } from 'date-fns';

interface RegisteredEvent {
  id: string;
  title: string;
  date: string;
}

export const CalendarDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadRegisteredEvents();
    }
  }, [open, user]);

  const loadRegisteredEvents = async () => {
    if (!user) return;
    
    try {
      const registrations = await getUserRegistrations(user.id);
      setRegisteredEvents(
        registrations.map((reg: any) => ({
          id: reg.event_id,
          title: reg.events?.title || 'Event',
          date: reg.events?.date || '',
        }))
      );
    } catch (error) {
      console.error('Error loading registered events:', error);
    }
  };

  // Get dates that have registered events
  const registeredDates = registeredEvents
    .map((event) => event.date)
    .filter(Boolean);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      const eventsOnDate = registeredEvents.filter((event) => 
        event.date && isSameDay(parseISO(event.date), date)
      );
      
      if (eventsOnDate.length > 0) {
        setOpen(false);
        navigate(`/events/${eventsOnDate[0].id}`);
      }
    }
  };

  // Custom day render with green dots
  const modifiers = {
    registered: registeredDates.map((date) => parseISO(date)),
  };

  const modifiersStyles = {
    registered: {
      position: 'relative' as const,
    },
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0 glass-card">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm">My Events Calendar</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              = Registered events
            </span>
          </p>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          components={{
            DayContent: ({ date }) => {
              const hasEvent = registeredDates.some((eventDate) =>
                isSameDay(parseISO(eventDate), date)
              );
              
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  {date.getDate()}
                  {hasEvent && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </div>
              );
            },
          }}
          className="rounded-md"
        />
        
        {registeredEvents.length > 0 && (
          <div className="p-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              You have {registeredEvents.length} registered event{registeredEvents.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
