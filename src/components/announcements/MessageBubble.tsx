import { format } from 'date-fns';
import { Check, CheckCheck, ExternalLink, Image, FileText, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DbAnnouncementMessage } from '@/lib/announcements';

interface MessageBubbleProps {
  message: DbAnnouncementMessage;
  isOwn: boolean;
  showSender?: boolean;
  onReply?: (message: DbAnnouncementMessage) => void;
  replyMessage?: DbAnnouncementMessage | null;
}

export const MessageBubble = ({ 
  message, 
  isOwn, 
  showSender = true, 
  onReply,
  replyMessage 
}: MessageBubbleProps) => {
  const time = format(new Date(message.created_at), 'h:mm a');
  const isOrganizer = message.sender_role === 'organizer';

  const renderContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="space-y-2">
            {message.attachment_url && (
              <img
                src={message.attachment_url}
                alt="Shared image"
                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.attachment_url!, '_blank')}
              />
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );
      case 'link':
        return (
          <div className="space-y-2">
            <p className="text-sm">{message.content}</p>
            {message.attachment_url && (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-accent hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {message.attachment_url.length > 40 
                  ? message.attachment_url.slice(0, 40) + '...' 
                  : message.attachment_url}
              </a>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="space-y-2">
            <p className="text-sm">{message.content}</p>
            {message.attachment_url && (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm">Download File</span>
              </a>
            )}
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div
      className={cn(
        "max-w-[80%] group relative",
        isOwn ? "ml-auto" : "mr-auto"
      )}
    >
      {/* Reply preview */}
      {replyMessage && (
        <div 
          className={cn(
            "text-xs px-3 py-1.5 rounded-t-lg border-l-2 mb-1",
            isOwn 
              ? "bg-primary/20 border-primary-foreground/50 text-primary-foreground/70" 
              : "bg-muted/50 border-primary text-muted-foreground"
          )}
        >
          <p className="font-medium">{replyMessage.sender_name}</p>
          <p className="truncate">{replyMessage.content}</p>
        </div>
      )}

      <div
        className={cn(
          "rounded-2xl p-4 relative",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : isOrganizer
              ? "bg-gradient-to-br from-secondary/20 to-accent/10 border border-secondary/30 rounded-bl-md"
              : "glass-card rounded-bl-md"
        )}
      >
        {/* Reply button */}
        {onReply && (
          <button
            onClick={() => onReply(message)}
            className={cn(
              "absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full",
              isOwn ? "bg-primary/20" : "bg-muted/50"
            )}
          >
            <Reply className="h-4 w-4" />
          </button>
        )}

        {/* Sender name for non-own messages */}
        {!isOwn && showSender && (
          <div className="flex items-center gap-2 mb-1">
            <p className={cn(
              "text-xs font-semibold",
              isOrganizer ? "text-secondary" : "text-primary"
            )}>
              {message.sender_name}
            </p>
            {isOrganizer && (
              <span className="px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-medium">
                Organizer
              </span>
            )}
          </div>
        )}

        {/* Message content */}
        {renderContent()}
      </div>

      {/* Time and read status */}
      <div className={cn(
        "flex items-center gap-1 mt-1",
        isOwn ? "justify-end" : "justify-start"
      )}>
        <p className="text-[10px] text-muted-foreground">{time}</p>
        {isOwn && (
          message.is_read 
            ? <CheckCheck className="h-3 w-3 text-blue" />
            : <Check className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};
