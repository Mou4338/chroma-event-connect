-- Add created_by column to events and recruitments
ALTER TABLE public.events ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.recruitments ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can insert recruitments" ON public.recruitments;
DROP POLICY IF EXISTS "Authenticated users can update recruitments" ON public.recruitments;
DROP POLICY IF EXISTS "Users can register for events" ON public.user_registrations;
DROP POLICY IF EXISTS "Users can view their registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Users can add ratings" ON public.event_ratings;
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.event_ratings;
DROP POLICY IF EXISTS "Anyone can insert event updates" ON public.event_updates;

-- Create proper RLS policies for events
CREATE POLICY "Authenticated users can insert events" 
ON public.events FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own events" 
ON public.events FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Create proper RLS policies for recruitments
CREATE POLICY "Authenticated users can insert recruitments" 
ON public.recruitments FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own recruitments" 
ON public.recruitments FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- User registrations - users can only see/insert their own
CREATE POLICY "Users can view their registrations" 
ON public.user_registrations FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" 
ON public.user_registrations FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Event ratings - users can only insert/view their own
CREATE POLICY "Users can add ratings for themselves" 
ON public.event_ratings FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view ratings" 
ON public.event_ratings FOR SELECT 
TO authenticated
USING (true);

-- Event updates - only event creator can add updates
CREATE POLICY "Event creators can add updates" 
ON public.event_updates FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_id 
    AND events.created_by = auth.uid()
  )
);