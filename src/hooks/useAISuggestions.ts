import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchEvents } from '@/lib/database';

interface Event {
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

interface UserEventData {
  registeredEvents: string[];
  attendedEvents: string[];
  ratings: Record<string, number>;
  feedbackScores: Record<string, number>;
  categoryPreferences: Record<string, number>;
}

const STORAGE_KEY = 'kiit_user_event_data';

const getStoredUserData = (): UserEventData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore parsing errors
  }
  return {
    registeredEvents: [],
    attendedEvents: [],
    ratings: {},
    feedbackScores: {},
    categoryPreferences: {},
  };
};

const saveUserData = (data: UserEventData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
};

// AI-ML Scoring Algorithm
const calculateEventScore = (event: Event, userData: UserEventData, allEvents: Event[]): number => {
  let score = 0;

  // Category preference scoring (highest weight)
  const categoryName = event.categories?.name || '';
  const categoryScore = userData.categoryPreferences[categoryName] || 0;
  score += categoryScore * 3;

  // Similar event pattern analysis
  const attendedCategories = allEvents
    .filter((e) => userData.attendedEvents.includes(e.id))
    .map((e) => e.categories?.name || '');
  
  if (attendedCategories.includes(categoryName)) {
    score += 15;
  }

  // Rating correlation - events similar to highly rated ones
  const highlyRatedEvents = allEvents.filter(
    (e) => userData.ratings[e.id] && userData.ratings[e.id] >= 4
  );
  
  highlyRatedEvents.forEach((ratedEvent) => {
    // Check tag similarity
    const commonTags = (event.tags || []).filter((tag) => (ratedEvent.tags || []).includes(tag));
    score += commonTags.length * 5;

    // Check society similarity
    if (event.society === ratedEvent.society) {
      score += 8;
    }
  });

  // Positive feedback boost
  const positiveEvents = Object.entries(userData.feedbackScores)
    .filter(([_, feedbackScore]) => feedbackScore >= 4)
    .map(([id]) => id);
  
  positiveEvents.forEach((eventId) => {
    const positiveEvent = allEvents.find((e) => e.id === eventId);
    if (positiveEvent && positiveEvent.categories?.name === categoryName) {
      score += 12;
    }
  });

  // Popularity factor
  score += Math.log((event.registrations || 0) + 1) * 2;

  // Rating factor
  score += (event.rating || 0) * 3;

  // Upcoming events get priority
  const eventDate = new Date(event.date);
  const now = new Date();
  const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil > 0 && daysUntil <= 7) {
    score += 10;
  } else if (daysUntil > 7 && daysUntil <= 30) {
    score += 5;
  }

  // Avoid already registered events
  if (userData.registeredEvents.includes(event.id)) {
    score = -1;
  }

  return score;
};

export const useAISuggestions = (limit: number = 4) => {
  const [suggestions, setSuggestions] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserEventData>(getStoredUserData);

  // Load events from database
  useEffect(() => {
    let mounted = true;
    
    const loadEvents = async () => {
      try {
        const events = await fetchEvents();
        if (mounted) {
          setAllEvents(events || []);
        }
      } catch (error) {
        console.error('Error loading events for AI suggestions:', error);
      }
    };
    
    loadEvents();
    return () => { mounted = false; };
  }, []);

  const computeSuggestions = useMemo(() => {
    if (allEvents.length === 0) return [];
    
    const scoredEvents = allEvents
      .map((event) => ({
        event,
        score: calculateEventScore(event, userData, allEvents),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.event);

    return scoredEvents;
  }, [userData, limit, allEvents]);

  useEffect(() => {
    if (allEvents.length === 0) return;
    
    setLoading(true);
    const timer = setTimeout(() => {
      setSuggestions(computeSuggestions);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [computeSuggestions, allEvents.length]);

  const registerForEvent = useCallback((eventId: string) => {
    setUserData(prev => {
      const newData = {
        ...prev,
        registeredEvents: [...prev.registeredEvents, eventId],
      };
      saveUserData(newData);
      return newData;
    });
  }, []);

  const rateEvent = useCallback((eventId: string, rating: number) => {
    const event = allEvents.find((e) => e.id === eventId);
    if (!event) return;

    const categoryName = event.categories?.name || '';
    setUserData(prev => {
      const newData = {
        ...prev,
        ratings: { ...prev.ratings, [eventId]: rating },
        categoryPreferences: {
          ...prev.categoryPreferences,
          [categoryName]: (prev.categoryPreferences[categoryName] || 0) + rating,
        },
      };
      saveUserData(newData);
      return newData;
    });
  }, [allEvents]);

  const submitFeedback = useCallback((eventId: string, score: number) => {
    const event = allEvents.find((e) => e.id === eventId);
    const categoryName = event?.categories?.name || 'General';
    
    setUserData(prev => {
      const newData = {
        ...prev,
        feedbackScores: { ...prev.feedbackScores, [eventId]: score },
        categoryPreferences: {
          ...prev.categoryPreferences,
          [categoryName]: (prev.categoryPreferences[categoryName] || 0) + score * 2,
        },
      };
      saveUserData(newData);
      return newData;
    });
  }, [allEvents]);

  const markAttended = useCallback((eventId: string) => {
    setUserData(prev => {
      if (prev.attendedEvents.includes(eventId)) return prev;
      
      const newData = {
        ...prev,
        attendedEvents: [...prev.attendedEvents, eventId],
      };
      saveUserData(newData);
      return newData;
    });
  }, []);

  return {
    suggestions,
    loading,
    registerForEvent,
    rateEvent,
    submitFeedback,
    markAttended,
    userData,
  };
};

export const getSimilarEvents = (event: Event, allEvents: Event[], limit: number = 4): Event[] => {
  const scored = allEvents
    .filter((e) => e.id !== event.id)
    .map((e) => {
      let score = 0;
      
      // Category match
      if (e.categories?.name === event.categories?.name) score += 20;
      
      // Tag similarity
      const commonTags = (e.tags || []).filter((tag) => (event.tags || []).includes(tag));
      score += commonTags.length * 8;
      
      // Society match
      if (e.society === event.society) score += 10;
      
      // Rating similarity
      score += Math.abs((e.rating || 0) - (event.rating || 0)) < 0.5 ? 5 : 0;
      
      return { event: e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.event);

  return scored;
};
