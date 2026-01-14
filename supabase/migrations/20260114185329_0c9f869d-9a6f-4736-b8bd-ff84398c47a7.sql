-- Fix: Announcement messages should only be visible to:
-- 1. The announcement creator (organizer)
-- 2. Users registered for the associated event (if linked to an event)
-- 3. All authenticated users for announcements not linked to events (public announcements)

-- Drop the overly permissive current policy
DROP POLICY IF EXISTS "messages_visible_to_authenticated_users" ON public.announcement_messages;

-- Create a more restrictive policy based on participation
CREATE POLICY "messages_visible_to_participants"
ON public.announcement_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM announcements a
    LEFT JOIN user_registrations ur ON ur.event_id = a.event_id AND ur.user_id = auth.uid()
    WHERE a.id = announcement_messages.announcement_id
    AND (
      -- Announcement creator can always see messages
      a.created_by = auth.uid()
      -- User registered for the event can see messages
      OR ur.user_id IS NOT NULL
      -- Public announcements (not linked to any event) are visible to all authenticated users
      OR a.event_id IS NULL
    )
  )
);