import { useState } from 'react';
import { Pin, ExternalLink } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { announcements } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Announcements = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(null);

  const selected = announcements.find((a) => a.id === selectedAnnouncement);

  const mockMessages = [
    { id: '1', content: 'Registration deadline extended!', sender: 'Admin', isOwn: false, time: '10:30 AM' },
    { id: '2', content: 'Thanks for the update!', sender: 'You', isOwn: true, time: '10:32 AM' },
    { id: '3', content: 'Don\'t forget to bring your ID cards.', sender: 'Admin', isOwn: false, time: '11:00 AM' },
    { id: '4', content: 'New venue update: Event shifted to Main Auditorium', sender: 'Admin', isOwn: false, time: '2:15 PM' },
  ];

  if (selected) {
    return (
      <MainLayout>
        <div className="space-y-4 animate-fade-in">
          <button
            onClick={() => setSelectedAnnouncement(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Announcements
          </button>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-bold">
                {selected.society.charAt(0)}
              </div>
              <div>
                <h1 className="font-semibold">{selected.eventName}</h1>
                <p className="text-sm text-muted-foreground">{selected.society}</p>
              </div>
            </div>
          </div>

          {/* Pinned Announcement */}
          {selected.isPinned && (
            <div className="glass-card p-4 border-orange/50 bg-orange/5">
              <div className="flex items-center gap-2 text-orange text-sm font-medium mb-2">
                <Pin className="h-4 w-4" />
                Pinned Announcement
              </div>
              <p className="text-sm">{selected.message}</p>
            </div>
          )}

          {/* Chat Messages */}
          <div className="space-y-4 pb-20">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[80%]",
                  msg.isOwn ? "ml-auto" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl p-4",
                    msg.isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "glass-card rounded-bl-md"
                  )}
                >
                  {!msg.isOwn && (
                    <p className="text-xs font-medium text-primary mb-1">{msg.sender}</p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                </div>
                <p className={cn(
                  "text-[10px] text-muted-foreground mt-1",
                  msg.isOwn ? "text-right" : "text-left"
                )}>
                  {msg.time}
                </p>
              </div>
            ))}

            {/* Update Link Example */}
            <div className="max-w-[80%] mr-auto">
              <div className="glass-card rounded-2xl rounded-bl-md p-4">
                <p className="text-xs font-medium text-primary mb-1">Admin</p>
                <p className="text-sm mb-2">Check out the updated schedule:</p>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Schedule PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">Announcements</h1>
        <p className="text-muted-foreground">Stay updated with the latest news from events and societies</p>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <button
              key={announcement.id}
              onClick={() => setSelectedAnnouncement(announcement.id)}
              className="w-full glass-card p-4 text-left hover:shadow-elevated transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  {announcement.society.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{announcement.eventName}</h3>
                    {announcement.isPinned && (
                      <Pin className="h-4 w-4 text-orange flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{announcement.society}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {announcement.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{announcement.timestamp}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Announcements;
