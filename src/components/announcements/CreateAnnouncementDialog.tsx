import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { createAnnouncement, sendMessage } from '@/lib/announcements';
import { useAuth } from '@/contexts/AuthContext';

interface CreateAnnouncementDialogProps {
  onCreated: () => void;
}

export const CreateAnnouncementDialog = ({ onCreated }: CreateAnnouncementDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    society: '',
    isPinned: false,
    firstMessage: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    if (!formData.title.trim() || !formData.society.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Create the announcement
      const announcement = await createAnnouncement({
        title: formData.title.trim(),
        society: formData.society.trim(),
        created_by: user.id,
        is_pinned: formData.isPinned,
      });

      // Send the first message if provided
      if (formData.firstMessage.trim()) {
        await sendMessage({
          announcement_id: announcement.id,
          sender_id: user.id,
          sender_name: user.username,
          sender_role: 'organizer',
          content: formData.firstMessage.trim(),
        });
      }

      toast.success('Announcement channel created!');
      setFormData({ title: '', society: '', isPinned: false, firstMessage: '' });
      setOpen(false);
      onCreated();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          New Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 gradient-text">
            <Megaphone className="h-5 w-5" />
            Create Announcement Channel
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Channel Name *</Label>
            <Input
              id="title"
              placeholder="e.g., TechFest 2025 Updates"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-muted/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="society">Society/Organization *</Label>
            <Input
              id="society"
              placeholder="e.g., Tech Society"
              value={formData.society}
              onChange={(e) => setFormData({ ...formData, society: e.target.value })}
              className="bg-muted/30"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pinned">Pin this channel</Label>
              <p className="text-xs text-muted-foreground">Pinned channels appear at the top</p>
            </div>
            <Switch
              id="pinned"
              checked={formData.isPinned}
              onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstMessage">First Announcement (Optional)</Label>
            <Input
              id="firstMessage"
              placeholder="Welcome message or first update..."
              value={formData.firstMessage}
              onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
              className="bg-muted/30"
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Channel'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
