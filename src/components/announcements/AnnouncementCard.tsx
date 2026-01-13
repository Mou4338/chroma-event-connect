import { format, formatDistanceToNow } from 'date-fns';
import { Pin, MessageCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DbAnnouncement } from '@/lib/announcements';

interface AnnouncementCardProps {
  announcement: DbAnnouncement;
  onClick: () => void;
  unreadCount?: number;
  lastMessage?: string;
  isOrganizer?: boolean;
}

export const AnnouncementCard = ({
  announcement,
  onClick,
  unreadCount = 0,
  lastMessage,
  isOrganizer = false,
}: AnnouncementCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(announcement.updated_at), { addSuffix: true });

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full glass-card p-4 text-left hover:shadow-elevated transition-all duration-300 relative overflow-hidden",
        announcement.is_pinned && "border-orange/30 bg-orange/5"
      )}
    >
      {/* Pinned indicator */}
      {announcement.is_pinned && (
        <div className="absolute top-0 right-0 px-2 py-1 bg-orange/20 rounded-bl-lg">
          <Pin className="h-3 w-3 text-orange" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0",
          isOrganizer ? "bg-gradient-to-br from-secondary to-accent text-white" : "gradient-bg text-primary-foreground"
        )}>
          {announcement.society.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold truncate">{announcement.title}</h3>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo}</span>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {announcement.society}
          </p>

          {/* Last message preview */}
          {lastMessage && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
              {lastMessage}
            </p>
          )}
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};
