import { useState, useEffect, useRef } from 'react';
import { Pin, ArrowLeft, MoreVertical, Search, Bell, BellOff, Users, Megaphone } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  fetchAnnouncements,
  fetchAnnouncementMessages,
  sendMessage,
  subscribeToMessages,
  updateLastRead,
  toggleAnnouncementPin,
  DbAnnouncement,
  DbAnnouncementMessage,
} from '@/lib/announcements';
import { MessageBubble } from '@/components/announcements/MessageBubble';
import { ChatInput } from '@/components/announcements/ChatInput';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { CreateAnnouncementDialog } from '@/components/announcements/CreateAnnouncementDialog';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<DbAnnouncement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<DbAnnouncement | null>(null);
  const [messages, setMessages] = useState<DbAnnouncementMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<DbAnnouncementMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'organizer'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load announcements
  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Subscribe to real-time messages when an announcement is selected
  useEffect(() => {
    if (!selectedAnnouncement) return;

    const channel = subscribeToMessages(selectedAnnouncement.id, (newMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      scrollToBottom();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedAnnouncement?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadAnnouncements = async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (announcement: DbAnnouncement) => {
    setMessagesLoading(true);
    try {
      const data = await fetchAnnouncementMessages(announcement.id);
      setMessages(data);
      
      // Mark as read
      if (user) {
        await updateLastRead(announcement.id, user.id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectAnnouncement = async (announcement: DbAnnouncement) => {
    setSelectedAnnouncement(announcement);
    await loadMessages(announcement);
  };

  const handleSendMessage = async (content: string, type?: 'text' | 'link', attachmentUrl?: string) => {
    if (!selectedAnnouncement || !user) return;

    try {
      const isOrganizer = selectedAnnouncement.created_by === user.id;
      
      await sendMessage({
        announcement_id: selectedAnnouncement.id,
        sender_id: user.id,
        sender_name: user.username,
        sender_role: isOrganizer ? 'organizer' : 'user',
        content,
        message_type: type || 'text',
        attachment_url: attachmentUrl,
        reply_to: replyTo?.id,
      });

      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTogglePin = async (announcement: DbAnnouncement) => {
    try {
      await toggleAnnouncementPin(announcement.id, !announcement.is_pinned);
      loadAnnouncements();
      toast.success(announcement.is_pinned ? 'Unpinned' : 'Pinned');
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.society.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'organizer') {
      return matchesSearch && a.created_by === user?.id;
    }
    return matchesSearch;
  });

  const isOrganizer = selectedAnnouncement?.created_by === user?.id;

  // Chat View
  if (selectedAnnouncement) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={() => {
                setSelectedAnnouncement(null);
                setMessages([]);
                setReplyTo(null);
              }}
              className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0",
              isOrganizer ? "bg-gradient-to-br from-secondary to-accent text-white" : "gradient-bg text-primary-foreground"
            )}>
              {selectedAnnouncement.society.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-semibold truncate">{selectedAnnouncement.title}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {selectedAnnouncement.society}
                {isOrganizer && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px]">
                    You're the organizer
                  </span>
                )}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-border">
                {isOrganizer && (
                  <DropdownMenuItem onClick={() => handleTogglePin(selectedAnnouncement)}>
                    <Pin className="h-4 w-4 mr-2" />
                    {selectedAnnouncement.is_pinned ? 'Unpin' : 'Pin'} Channel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Mute Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Pinned banner */}
          {selectedAnnouncement.is_pinned && (
            <div className="px-4 py-2 bg-orange/10 border-b border-orange/20 flex items-center gap-2 text-orange text-sm">
              <Pin className="h-4 w-4" />
              <span>Pinned Channel</span>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Megaphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                {isOrganizer 
                  ? 'Start by sending your first announcement!'
                  : 'Wait for the organizer to post updates'}
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const showSender = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
              const replyMessage = msg.reply_to 
                ? messages.find(m => m.id === msg.reply_to) 
                : null;
              
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender_id === user?.id}
                  showSender={showSender}
                  onReply={setReplyTo}
                  replyMessage={replyMessage}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <ChatInput
          onSend={handleSendMessage}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          placeholder={isOrganizer ? "Send an announcement..." : "Send a message..."}
        />
      </div>
    );
  }

  // List View
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Announcements</h1>
            <p className="text-muted-foreground text-sm">Stay updated with the latest news</p>
          </div>
          <CreateAnnouncementDialog onCreated={loadAnnouncements} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'organizer')}>
          <TabsList className="grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger value="all" className="gap-2">
              <Bell className="h-4 w-4" />
              All Updates
            </TabsTrigger>
            <TabsTrigger value="organizer" className="gap-2">
              <Megaphone className="h-4 w-4" />
              My Channels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No announcements yet</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Try a different search' : 'Create a channel to get started'}
                </p>
              </div>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onClick={() => handleSelectAnnouncement(announcement)}
                  isOrganizer={announcement.created_by === user?.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="organizer" className="mt-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Megaphone className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No channels created</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create an announcement channel to broadcast updates
                </p>
                <CreateAnnouncementDialog onCreated={loadAnnouncements} />
              </div>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onClick={() => handleSelectAnnouncement(announcement)}
                  isOrganizer={true}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Announcements;