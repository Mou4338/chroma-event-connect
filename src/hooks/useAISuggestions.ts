import { useState, useEffect, useMemo } from 'react';
import { Event } from '@/types';
import { events as allEvents } from '@/data/mockData';

interface UserEventData {
  registeredEvents: string[];
  attendedEvents: string[];
  ratings: Record<string, number>;
  feedbackScores: Record<string, number>;
  categoryPreferences: Record<string, number>;
}

// Simulated user event history (in production, this would come from the database)
const getMockUserEventData = (): UserEventData => {
  const saved = localStorage.getItem('userEventData');
  if (saved) {
    return JSON.parse(saved);
  }
  // Default mock data for new users
  return {
    registeredEvents: ['1', '3', '5'], // TechFest, Startup Summit, AI Workshop
    attendedEvents: ['1', '3'],
    ratings: { '1': 5, '3': 4 },
    feedbackScores: { '1': 5, '3': 4 },
    categoryPreferences: {
      Technical: 10,
      Business: 8,
      Workshop: 6,
    },
  };
};

const saveUserEventData = (data: UserEventData) => {
  localStorage.setItem('userEventData', JSON.stringify(data));
};

// AI-ML Scoring Algorithm
const calculateEventScore = (event: Event, userData: UserEventData): number => {
  let score = 0;

  // Category preference scoring (highest weight)
  const categoryScore = userData.categoryPreferences[event.category] || 0;
  score += categoryScore * 3;

  // Similar event pattern analysis
  const attendedCategories = allEvents
    .filter((e) => userData.attendedEvents.includes(e.id))
    .map((e) => e.category);
  
  if (attendedCategories.includes(event.category)) {
    score += 15;
  }

  // Rating correlation - events similar to highly rated ones
  const highlyRatedEvents = allEvents.filter(
    (e) => userData.ratings[e.id] && userData.ratings[e.id] >= 4
  );
  
  highlyRatedEvents.forEach((ratedEvent) => {
    // Check tag similarity
    const commonTags = event.tags.filter((tag) => ratedEvent.tags.includes(tag));
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
    if (positiveEvent && positiveEvent.category === event.category) {
      score += 12;
    }
  });

  // Popularity factor
  score += Math.log(event.registrations + 1) * 2;

  // Rating factor
  score += event.rating * 3;

  // Avoid already registered events
  if (userData.registeredEvents.includes(event.id)) {
    score = -1;
  }

  return score;
};

export const useAISuggestions = (limit: number = 4) => {
  const [suggestions, setSuggestions] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserEventData>(getMockUserEventData());

  const computeSuggestions = useMemo(() => {
    const scoredEvents = allEvents
      .map((event) => ({
        event,
        score: calculateEventScore(event, userData),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.event);

    return scoredEvents;
  }, [userData, limit]);

  useEffect(() => {
    // Simulate AI processing delay
    setLoading(true);
    const timer = setTimeout(() => {
      setSuggestions(computeSuggestions);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [computeSuggestions]);

  const registerForEvent = (eventId: string) => {
    const newData = {
      ...userData,
      registeredEvents: [...userData.registeredEvents, eventId],
    };
    setUserData(newData);
    saveUserEventData(newData);
  };

  const rateEvent = (eventId: string, rating: number) => {
    const event = allEvents.find((e) => e.id === eventId);
    if (!event) return;

    const newData = {
      ...userData,
      ratings: { ...userData.ratings, [eventId]: rating },
      categoryPreferences: {
        ...userData.categoryPreferences,
        [event.category]: (userData.categoryPreferences[event.category] || 0) + rating,
      },
    };
    setUserData(newData);
    saveUserEventData(newData);
  };

  const submitFeedback = (eventId: string, score: number) => {
    const event = allEvents.find((e) => e.id === eventId);
    if (!event) return;

    const newData = {
      ...userData,
      feedbackScores: { ...userData.feedbackScores, [eventId]: score },
      categoryPreferences: {
        ...userData.categoryPreferences,
        [event.category]: (userData.categoryPreferences[event.category] || 0) + score * 2,
      },
    };
    setUserData(newData);
    saveUserEventData(newData);
  };

  const markAttended = (eventId: string) => {
    if (!userData.attendedEvents.includes(eventId)) {
      const newData = {
        ...userData,
        attendedEvents: [...userData.attendedEvents, eventId],
      };
      setUserData(newData);
      saveUserEventData(newData);
    }
  };

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

export const getSimilarEvents = (event: Event, limit: number = 4): Event[] => {
  const scored = allEvents
    .filter((e) => e.id !== event.id)
    .map((e) => {
      let score = 0;
      
      // Category match
      if (e.category === event.category) score += 20;
      
      // Tag similarity
      const commonTags = e.tags.filter((tag) => event.tags.includes(tag));
      score += commonTags.length * 8;
      
      // Society match
      if (e.society === event.society) score += 10;
      
      // Rating similarity
      score += Math.abs(e.rating - event.rating) < 0.5 ? 5 : 0;
      
      return { event: e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.event);

  return scored;
};
