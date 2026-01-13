-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  society TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_by UUID,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcement_messages table for WhatsApp-like chat
CREATE TABLE public.announcement_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  reply_to UUID REFERENCES public.announcement_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_announcement_reads table to track read status
CREATE TABLE public.user_announcement_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_announcement_reads ENABLE ROW LEVEL SECURITY;

-- Announcements policies
CREATE POLICY "announcements_select_all" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "announcements_insert_auth" ON public.announcements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "announcements_update_owner" ON public.announcements FOR UPDATE USING (auth.uid() = created_by);

-- Messages policies
CREATE POLICY "messages_select_all" ON public.announcement_messages FOR SELECT USING (true);
CREATE POLICY "messages_insert_auth" ON public.announcement_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User reads policies
CREATE POLICY "reads_select_own" ON public.user_announcement_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reads_insert_own" ON public.user_announcement_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reads_update_own" ON public.user_announcement_reads FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger for announcements
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcement_messages;