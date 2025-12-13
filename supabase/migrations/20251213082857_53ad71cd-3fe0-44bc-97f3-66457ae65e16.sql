-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  poster TEXT NOT NULL,
  venue TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  registrations INTEGER DEFAULT 0,
  society TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_updates table
CREATE TABLE public.event_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recruitments table
CREATE TABLE public.recruitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  poster TEXT NOT NULL,
  society TEXT NOT NULL,
  deadline DATE NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  applicants INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_registrations table
CREATE TABLE public.user_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  UNIQUE(user_id, event_id)
);

-- Create event_ratings table
CREATE TABLE public.event_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert categories" ON public.categories FOR INSERT WITH CHECK (true);

-- RLS Policies for events (public read, authenticated write)
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update events" ON public.events FOR UPDATE USING (true);

-- RLS Policies for event_updates (public read)
CREATE POLICY "Anyone can view event updates" ON public.event_updates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert event updates" ON public.event_updates FOR INSERT WITH CHECK (true);

-- RLS Policies for recruitments (public read, authenticated write)
CREATE POLICY "Anyone can view recruitments" ON public.recruitments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert recruitments" ON public.recruitments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update recruitments" ON public.recruitments FOR UPDATE USING (true);

-- RLS Policies for user_registrations
CREATE POLICY "Users can view their registrations" ON public.user_registrations FOR SELECT USING (true);
CREATE POLICY "Users can register for events" ON public.user_registrations FOR INSERT WITH CHECK (true);

-- RLS Policies for event_ratings
CREATE POLICY "Anyone can view ratings" ON public.event_ratings FOR SELECT USING (true);
CREATE POLICY "Users can add ratings" ON public.event_ratings FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recruitments_updated_at
  BEFORE UPDATE ON public.recruitments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recruitments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;