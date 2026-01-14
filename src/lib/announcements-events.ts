import { supabase } from '@/integrations/supabase/client';

// Create announcement channel for an event
export const createEventAnnouncementChannel = async (params: {
  eventId: string;
  title: string;
  society: string;
  createdBy: string;
}) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      event_id: params.eventId,
      title: `${params.title} Updates`,
      society: params.society,
      created_by: params.createdBy,
      is_pinned: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get announcement channel for an event
export const getEventAnnouncementChannel = async (eventId: string) => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Check if user is registered for an event
export const isUserRegisteredForEvent = async (userId: string, eventId: string) => {
  const { data, error } = await supabase
    .from('user_registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};
