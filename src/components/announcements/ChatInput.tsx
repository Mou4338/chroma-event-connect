import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Link, Image, X, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DbAnnouncementMessage } from '@/lib/announcements';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInputProps {
  onSend: (content: string, type?: 'text' | 'link', attachmentUrl?: string) => void;
  replyTo?: DbAnnouncementMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ 
  onSend, 
  replyTo, 
  onCancelReply, 
  disabled,
  placeholder = "Type a message..."
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() && !linkUrl.trim()) return;
    
    if (showLinkInput && linkUrl.trim()) {
      onSend(message.trim() || 'Shared a link', 'link', linkUrl.trim());
      setLinkUrl('');
      setShowLinkInput(false);
    } else {
      onSend(message.trim(), 'text');
    }
    
    setMessage('');
    if (onCancelReply) onCancelReply();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const emojis = ['👍', '❤️', '😊', '🎉', '👏', '🔥', '💯', '✨'];

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border p-4 pb-safe">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 mb-2 border-l-2 border-primary">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">{replyTo.sender_name}</p>
            <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Link input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="url"
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button 
            onClick={() => setShowLinkInput(false)} 
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0" disabled={disabled}>
              <Paperclip className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="glass-card border-border">
            <DropdownMenuItem onClick={() => setShowLinkInput(true)}>
              <Link className="h-4 w-4 mr-2" />
              Share Link
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Image className="h-4 w-4 mr-2" />
              Share Image (Coming soon)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Emoji picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0" disabled={disabled}>
              <Smile className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="glass-card border-border p-2">
            <div className="flex gap-1 flex-wrap max-w-[200px]">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-xl hover:bg-muted rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-[120px] resize-none bg-muted/30 border-border/50 pr-12"
            rows={1}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !linkUrl.trim())}
          variant="gradient"
          size="icon"
          className="flex-shrink-0 h-11 w-11"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
