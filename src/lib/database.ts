import { supabase } from '@/integrations/supabase/client';

export interface DbEvent {
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
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface DbCategory {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export interface DbRecruitment {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  poster: string;
  society: string;
  deadline: string;
  requirements: string[];
  rating: number;
  rating_count: number;
  applicants: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface DbEventUpdate {
  id: string;
  event_id: string;
  message: string;
  created_at: string;
}

// Fetch all events
export const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*, categories(name, icon)')
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Fetch events by category
export const fetchEventsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, categories(name, icon)')
    .eq('category_id', categoryId)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Search events
export const searchEvents = async (query: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, categories(name, icon)')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,society.ilike.%${query}%,venue.ilike.%${query}%`)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Fetch single event
export const fetchEventById = async (id: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, categories(name, icon)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Fetch event updates
export const fetchEventUpdates = async (eventId: string) => {
  const { data, error } = await supabase
    .from('event_updates')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Fetch all categories
export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Fetch all recruitments
export const fetchRecruitments = async () => {
  const { data, error } = await supabase
    .from('recruitments')
    .select('*, categories(name, icon)')
    .order('deadline', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Fetch recruitments by category
export const fetchRecruitmentsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('recruitments')
    .select('*, categories(name, icon)')
    .eq('category_id', categoryId)
    .order('deadline', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Fetch single recruitment
export const fetchRecruitmentById = async (id: string) => {
  const { data, error } = await supabase
    .from('recruitments')
    .select('*, categories(name, icon)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Create event
export const createEvent = async (event: Omit<DbEvent, 'id' | 'created_at' | 'updated_at' | 'rating' | 'rating_count' | 'registrations'>) => {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Create recruitment
export const createRecruitment = async (recruitment: Omit<DbRecruitment, 'id' | 'created_at' | 'updated_at' | 'rating' | 'rating_count' | 'applicants'>) => {
  const { data, error } = await supabase
    .from('recruitments')
    .insert(recruitment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Add event update
export const addEventUpdate = async (eventId: string, message: string) => {
  const { data, error } = await supabase
    .from('event_updates')
    .insert({ event_id: eventId, message })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Register for event
export const registerForEvent = async (userId: string, eventId: string) => {
  const { data, error } = await supabase
    .from('user_registrations')
    .insert({ user_id: userId, event_id: eventId })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Get user's registered events
export const getUserRegistrations = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_registrations')
    .select('*, events(*)')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

// Subscribe to real-time event updates
export const subscribeToEvents = (callback: (payload: any) => void) => {
  return supabase
    .channel('events-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, callback)
    .subscribe();
};

// Subscribe to real-time recruitment updates
export const subscribeToRecruitments = (callback: (payload: any) => void) => {
  return supabase
    .channel('recruitments-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'recruitments' }, callback)
    .subscribe();
};
