import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Image, Tag, MapPin, Clock, FileText, Briefcase, List, ChevronDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createEvent, createRecruitment, fetchCategories } from '@/lib/database';
import { createEventAnnouncementChannel } from '@/lib/announcements-events';
import { toast } from 'sonner';

type FormType = 'event' | 'recruitment';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const Organizer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formType, setFormType] = useState<FormType>('event');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category_id: '',
    poster: '',
    venue: '',
    date: '',
    time: '',
    tags: '',
    society: '',
    createAnnouncementChannel: true,
  });

  // Recruitment form state
  const [recruitmentForm, setRecruitmentForm] = useState({
    title: '',
    description: '',
    category_id: '',
    poster: '',
    society: '',
    deadline: '',
    requirements: '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('You must be logged in to create an event');
      return;
    }

    setLoading(true);
    try {
      const createdEvent = await createEvent({
        title: eventForm.title,
        description: eventForm.description,
        category_id: eventForm.category_id || null,
        poster: eventForm.poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        venue: eventForm.venue,
        date: eventForm.date,
        time: eventForm.time,
        tags: eventForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        society: eventForm.society,
        created_by: user.id,
      });
      
      // Create announcement channel if requested
      if (eventForm.createAnnouncementChannel && createdEvent) {
        try {
          await createEventAnnouncementChannel({
            eventId: createdEvent.id,
            title: eventForm.title,
            society: eventForm.society,
            createdBy: user.id,
          });
          toast.success('Event created with announcement channel!');
        } catch (channelError) {
          console.error('Error creating announcement channel:', channelError);
          toast.success('Event created! (Announcement channel could not be created)');
        }
      } else {
        toast.success('Event created successfully!');
      }
      
      setEventForm({
        title: '',
        description: '',
        category_id: '',
        poster: '',
        venue: '',
        date: '',
        time: '',
        tags: '',
        society: '',
        createAnnouncementChannel: true,
      });
      navigate('/events');
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleRecruitmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('You must be logged in to create a recruitment');
      return;
    }

    setLoading(true);
    try {
      await createRecruitment({
        title: recruitmentForm.title,
        description: recruitmentForm.description,
        category_id: recruitmentForm.category_id || null,
        poster: recruitmentForm.poster || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
        society: recruitmentForm.society,
        deadline: recruitmentForm.deadline,
        requirements: recruitmentForm.requirements.split(',').map(r => r.trim()).filter(Boolean),
        created_by: user.id,
      });
      
      toast.success('Recruitment created successfully!');
      setRecruitmentForm({
        title: '',
        description: '',
        category_id: '',
        poster: '',
        society: '',
        deadline: '',
        requirements: '',
      });
      navigate('/recruitment');
    } catch (error: any) {
      console.error('Error creating recruitment:', error);
      toast.error(error.message || 'Failed to create recruitment');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(
    c => c.id === (formType === 'event' ? eventForm.category_id : recruitmentForm.category_id)
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text">Event Organizer</h1>
          <p className="text-muted-foreground mt-2">Create and manage events & recruitments</p>
        </div>

        {/* Form Type Selector */}
        <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
          <Button
            variant={formType === 'event' ? 'gradient' : 'ghost'}
            className="flex-1"
            onClick={() => setFormType('event')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Create Event
          </Button>
          <Button
            variant={formType === 'recruitment' ? 'gradient' : 'ghost'}
            className="flex-1"
            onClick={() => setFormType('recruitment')}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Create Recruitment
          </Button>
        </div>

        {/* Event Form */}
        {formType === 'event' && (
          <form onSubmit={handleEventSubmit} className="glass-card p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Event Title
              </label>
              <Input
                placeholder="Enter event title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <List className="h-4 w-4 text-secondary" />
                Description
              </label>
              <Textarea
                placeholder="Enter event description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-accent" />
                  Category
                </label>
                <div className="relative">
                  <Button
                    type="button"
                    variant="glass"
                    className="w-full justify-between"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    {selectedCategory ? (
                      <span>{selectedCategory.icon} {selectedCategory.name}</span>
                    ) : (
                      'Select category'
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-auto">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center gap-2"
                          onClick={() => {
                            setEventForm({ ...eventForm, category_id: cat.id });
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange" />
                  Society/Club
                </label>
                <Input
                  placeholder="Society name"
                  value={eventForm.society}
                  onChange={(e) => setEventForm({ ...eventForm, society: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Date
                </label>
                <Input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  Time
                </label>
                <Input
                  placeholder="e.g., 10:00 AM"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                Venue
              </label>
              <Input
                placeholder="Enter venue"
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Image className="h-4 w-4 text-orange" />
                Poster URL
              </label>
              <Input
                placeholder="https://example.com/poster.jpg"
                value={eventForm.poster}
                onChange={(e) => setEventForm({ ...eventForm, poster: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Tags (comma-separated)
              </label>
              <Input
                placeholder="e.g., Coding, Hackathon, Tech"
                value={eventForm.tags}
                onChange={(e) => setEventForm({ ...eventForm, tags: e.target.value })}
              />
            </div>

            {/* Announcement Channel Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="announcement-channel" className="text-sm font-medium">
                    Create Announcement Channel
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically create a channel for event updates
                  </p>
                </div>
              </div>
              <Switch
                id="announcement-channel"
                checked={eventForm.createAnnouncementChannel}
                onCheckedChange={(checked) => 
                  setEventForm({ ...eventForm, createAnnouncementChannel: checked })
                }
              />
            </div>

            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
              <Plus className="h-5 w-5 mr-2" />
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </form>
        )}

        {/* Recruitment Form */}
        {formType === 'recruitment' && (
          <form onSubmit={handleRecruitmentSubmit} className="glass-card p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Position Title
              </label>
              <Input
                placeholder="Enter position title"
                value={recruitmentForm.title}
                onChange={(e) => setRecruitmentForm({ ...recruitmentForm, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <List className="h-4 w-4 text-secondary" />
                Description
              </label>
              <Textarea
                placeholder="Enter position description"
                value={recruitmentForm.description}
                onChange={(e) => setRecruitmentForm({ ...recruitmentForm, description: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-accent" />
                  Category
                </label>
                <div className="relative">
                  <Button
                    type="button"
                    variant="glass"
                    className="w-full justify-between"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    {selectedCategory ? (
                      <span>{selectedCategory.icon} {selectedCategory.name}</span>
                    ) : (
                      'Select category'
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-auto">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center gap-2"
                          onClick={() => {
                            setRecruitmentForm({ ...recruitmentForm, category_id: cat.id });
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange" />
                  Society/Club
                </label>
                <Input
                  placeholder="Society name"
                  value={recruitmentForm.society}
                  onChange={(e) => setRecruitmentForm({ ...recruitmentForm, society: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Application Deadline
              </label>
              <Input
                type="date"
                value={recruitmentForm.deadline}
                onChange={(e) => setRecruitmentForm({ ...recruitmentForm, deadline: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Image className="h-4 w-4 text-orange" />
                Poster URL
              </label>
              <Input
                placeholder="https://example.com/poster.jpg"
                value={recruitmentForm.poster}
                onChange={(e) => setRecruitmentForm({ ...recruitmentForm, poster: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Requirements (comma-separated)
              </label>
              <Input
                placeholder="e.g., 2nd year+, Leadership skills, Coding experience"
                value={recruitmentForm.requirements}
                onChange={(e) => setRecruitmentForm({ ...recruitmentForm, requirements: e.target.value })}
              />
            </div>

            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
              <Plus className="h-5 w-5 mr-2" />
              {loading ? 'Creating...' : 'Create Recruitment'}
            </Button>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default Organizer;
