-- Fix: Announcement messages should only be visible to authenticated users
-- The current policy "messages_select_all" uses USING (true) which is too permissive
-- We'll replace it with a policy that requires authentication

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "messages_select_all" ON public.announcement_messages;

-- Create a proper policy that requires authentication
-- Since announcements are public channels (similar to WhatsApp broadcast lists),
-- any authenticated user can view messages in channels they can access
CREATE POLICY "messages_visible_to_authenticated_users"
ON public.announcement_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM announcements 
    WHERE announcements.id = announcement_messages.announcement_id
  )
);