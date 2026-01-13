import { supabase } from '@/integrations/supabase/client';

export interface DbAnnouncement {
  id: string;
  title: string;
  society: string;
  event_id: string | null;
  created_by: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbAnnouncementMessage {
  id: string;
  announcement_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'organizer' | 'user';
  content: string;
  message_type: 'text' | 'image' | 'link' | 'file';
  attachment_url: string | null;
  is_read: boolean;
  reply_to: string | null;
  created_at: string;
}

// Fetch all announcements
export const fetchAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data as DbAnnouncement[];
};

// Fetch single announcement
export const fetchAnnouncementById = async (id: string) => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data as DbAnnouncement | null;
};

// Fetch messages for an announcement
export const fetchAnnouncementMessages = async (announcementId: string) => {
  const { data, error } = await supabase
    .from('announcement_messages')
    .select('*')
    .eq('announcement_id', announcementId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data as DbAnnouncementMessage[];
};

// Send a message
export const sendMessage = async (message: {
  announcement_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'organizer' | 'user';
  content: string;
  message_type?: 'text' | 'image' | 'link' | 'file';
  attachment_url?: string;
  reply_to?: string;
}) => {
  const { data, error } = await supabase
    .from('announcement_messages')
    .insert({
      announcement_id: message.announcement_id,
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      sender_role: message.sender_role,
      content: message.content,
      message_type: message.message_type || 'text',
      attachment_url: message.attachment_url,
      reply_to: message.reply_to,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as DbAnnouncementMessage;
};

// Create announcement
export const createAnnouncement = async (announcement: {
  title: string;
  society: string;
  event_id?: string;
  created_by: string;
  is_pinned?: boolean;
}) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcement)
    .select()
    .single();
  
  if (error) throw error;
  return data as DbAnnouncement;
};

// Toggle pin status
export const toggleAnnouncementPin = async (id: string, isPinned: boolean) => {
  const { data, error } = await supabase
    .from('announcements')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as DbAnnouncement;
};

// Get unread count for an announcement
export const getUnreadCount = async (announcementId: string, userId: string, lastReadAt: string) => {
  const { count, error } = await supabase
    .from('announcement_messages')
    .select('*', { count: 'exact', head: true })
    .eq('announcement_id', announcementId)
    .gt('created_at', lastReadAt)
    .neq('sender_id', userId);
  
  if (error) throw error;
  return count || 0;
};

// Update last read time
export const updateLastRead = async (announcementId: string, userId: string) => {
  const { error } = await supabase
    .from('user_announcement_reads')
    .upsert({
      user_id: userId,
      announcement_id: announcementId,
      last_read_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,announcement_id'
    });
  
  if (error) throw error;
};

// Subscribe to real-time messages
export const subscribeToMessages = (
  announcementId: string,
  callback: (message: DbAnnouncementMessage) => void
) => {
  return supabase
    .channel(`announcement-${announcementId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'announcement_messages',
        filter: `announcement_id=eq.${announcementId}`,
      },
      (payload) => {
        callback(payload.new as DbAnnouncementMessage);
      }
    )
    .subscribe();
};
