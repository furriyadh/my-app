"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationUser {
  avatarUrl?: string;
  name: string;
  initials?: string;
  color?: string;
}

export interface NotificationItem {
  id: string;
  user: NotificationUser;
  message: string;
  timestamp?: string;
  priority?: 'low' | 'medium' | 'high';
  type?: 'info' | 'success' | 'warning' | 'error';
  fadingOut?: boolean;
}

export interface AnimatedNotificationProps {
  maxNotifications?: number;
  autoInterval?: number;
  autoGenerate?: boolean;
  notifications?: NotificationItem[];
  customMessages?: string[];
  animationDuration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  width?: number;
  showAvatars?: boolean;
  showTimestamps?: boolean;
  className?: string;
  onNotificationClick?: (notification: NotificationItem) => void;
  onNotificationDismiss?: (notification: NotificationItem) => void;
  allowDismiss?: boolean;
  autoDismissTimeout?: number;
  userApiEndpoint?: string;
  variant?: 'default' | 'minimal' | 'glass' | 'bordered';
}

const defaultMessages = [
  "Campaign optimized! ROI +45% 📈",
  "New conversion detected 🎯",
  "AI adjusted bidding strategy 🤖",
  "Budget allocation optimized 💰",
  "Keywords updated automatically ✨",
  "Performance report ready 📊",
  "New audience segment found 👥",
  "Ad copy A/B test completed ✅",
  "Cost per click reduced -30% 💪",
  "Quality score improved! ⭐"
];

const Avatar: React.FC<{
  user: NotificationUser;
  showAvatar: boolean;
}> = ({ user, showAvatar }) => {
  if (!showAvatar) return null;

  return (
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center transition-all duration-300 backdrop-blur-sm shadow-lg shadow-purple-500/30">
      <span className="text-xs font-bold text-white">
        AI
      </span>
    </div>
  );
};

const Notification: React.FC<{
  notification: NotificationItem;
  showAvatars: boolean;
  showTimestamps: boolean;
  variant: string;
  onDismiss?: () => void;
  onClick?: () => void;
  allowDismiss: boolean;
}> = ({
  notification,
  showAvatars,
  showTimestamps,
  variant,
  onDismiss,
  onClick,
  allowDismiss
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return "bg-gray-900/95 border border-gray-700/50 backdrop-blur-xl";
      case 'glass':
        return "bg-gray-900/30 backdrop-blur-2xl border border-white/20 shadow-2xl";
      case 'bordered':
        return "bg-gray-900/95 border-2 border-purple-500/30 backdrop-blur-lg shadow-xl";
      default:
        return "bg-gray-900/30 backdrop-blur-2xl border border-white/20 shadow-2xl";
    }
  };

  const getPriorityStyles = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-l-4 border-l-red-500 shadow-red-500/20';
      case 'medium':
        return 'border-l-4 border-l-yellow-500 shadow-yellow-500/20';
      case 'low':
        return 'border-l-4 border-l-blue-500 shadow-blue-500/20';
      default:
        return 'border-l-4 border-l-purple-500/50 shadow-purple-500/20';
    }
  };

  return (
    <div
      className={cn(
        "group relative transition-all duration-500 ease-out transform",
        "rounded-xl p-3 flex items-center gap-2.5",
        "w-64 max-w-[calc(100vw-2rem)] cursor-pointer",
        getVariantStyles(),
        getPriorityStyles(),
        notification.fadingOut && "animate-pulse"
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
      
      {/* Avatar */}
      {showAvatars && <Avatar user={notification.user} showAvatar={showAvatars} />}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white/90 line-clamp-1">
          {notification.message}
        </p>
        {showTimestamps && notification.timestamp && (
          <span className="text-[10px] text-white/50 mt-0.5 block">
            {notification.timestamp}
          </span>
        )}
      </div>
      {allowDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
          className="flex-shrink-0 w-4 h-4 text-gray-400/50 hover:text-gray-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

async function fetchRandomUser(apiEndpoint?: string): Promise<NotificationUser> {
  try {
    const endpoint = apiEndpoint || "https://randomuser.me/api/";
    const res = await fetch(endpoint);
    const data = await res.json();
    const user = data.results[0];
    return {
      avatarUrl: user.picture?.large,
      name: `${user.name.first} ${user.name.last}`,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`
    };
  } catch (error) {
    const names = ['Furriyadh AI', 'Smart Campaign', 'AI Optimizer', 'Ad Manager', 'Performance Bot'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return {
      name: randomName,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`
    };
  }
}

function getRandomMessage(customMessages?: string[]): string {
  const messages = customMessages || defaultMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}

async function generateNotification(
  customMessages?: string[],
  userApiEndpoint?: string
): Promise<NotificationItem> {
  const user = await fetchRandomUser(userApiEndpoint);
  return {
    id: crypto.randomUUID(),
    user,
    message: getRandomMessage(customMessages),
    timestamp: new Date().toLocaleTimeString(),
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
  };
}

const AnimatedNotification: React.FC<AnimatedNotificationProps> = ({
  maxNotifications = 3,
  autoInterval = 4000,
  autoGenerate = true,
  notifications = [],
  customMessages,
  animationDuration = 800,
  position = 'center',
  width = 320,
  showAvatars = true,
  showTimestamps = true,
  className,
  onNotificationClick,
  onNotificationDismiss,
  allowDismiss = true,
  autoDismissTimeout = 0,
  userApiEndpoint,
  variant = 'glass'
}) => {
  const [notes, setNotes] = useState<NotificationItem[]>(notifications);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dismissTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissNotification = useCallback((id: string) => {
    setNotes(prev => {
      const noteToDismiss = prev.find(note => note.id === id);
      if (!noteToDismiss || noteToDismiss.fadingOut) {
        return prev;
      }
      const updatedNotes = prev.map(note =>
        note.id === id ? { ...note, fadingOut: true } : note
      );
      const timeout = dismissTimeouts.current.get(id);
      if (timeout) {
        clearTimeout(timeout);
        dismissTimeouts.current.delete(id);
      }
      setTimeout(() => {
        setNotes(current => current.filter(note => note.id !== id));
      }, animationDuration);
      return updatedNotes;
    });
  }, [animationDuration]);

  const addNote = useCallback(async () => {
    if (!autoGenerate) return;
    const newNote = await generateNotification(customMessages, userApiEndpoint);
    setNotes((prev) => {
      let currentNotes = [...prev];
      if (currentNotes.length >= maxNotifications) {
        const oldestNote = currentNotes[0];
        if (oldestNote && !oldestNote.fadingOut) {
          currentNotes = currentNotes.map((note, i) =>
            i === 0 ? { ...note, fadingOut: true } : note
          );
          setTimeout(() => {
            setNotes(current => current.filter(note => note.id !== oldestNote.id));
          }, animationDuration);
        }
      }
      return [...currentNotes, newNote];
    });
    if (autoDismissTimeout > 0) {
      const timeout = setTimeout(() => {
        dismissNotification(newNote.id);
      }, autoDismissTimeout);
      dismissTimeouts.current.set(newNote.id, timeout);
    }
    if (autoGenerate) {
      timeoutRef.current = setTimeout(addNote, autoInterval);
    }
  }, [
    autoGenerate,
    customMessages,
    userApiEndpoint,
    maxNotifications,
    autoInterval,
    autoDismissTimeout,
    animationDuration,
    dismissNotification
  ]);

  useEffect(() => {
    if (autoGenerate) {
      timeoutRef.current = setTimeout(addNote, 1000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      dismissTimeouts.current.forEach(timeout => clearTimeout(timeout));
      dismissTimeouts.current.clear();
    };
  }, [addNote, autoGenerate]);

  useEffect(() => {
    if (notifications.length > 0 && JSON.stringify(notes) !== JSON.stringify(notifications)) {
      setNotes(notifications);
      dismissTimeouts.current.forEach(timeout => clearTimeout(timeout));
      dismissTimeouts.current.clear();
    }
  }, [notifications, notes]);

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'fixed top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-50';
      case 'top-right':
        return 'fixed top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50';
      case 'bottom-left':
        return 'fixed bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 z-50';
      case 'bottom-right':
        return 'fixed bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-50';
      default:
        return 'flex items-center justify-center min-h-auto p-4 sm:p-6';
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes notification-enter {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
              filter: blur(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0px);
            }
          }
          @keyframes notification-exit {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0px);
            }
            to {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
              filter: blur(4px);
            }
          }
          .notification-enter {
            animation: notification-enter var(--animation-duration) cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .notification-exit {
            animation: notification-exit var(--animation-duration) cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `
      }} />
      <div className={cn(getPositionStyles(), className)}>
        <Flipper flipKey={notes.map((note) => note.id).join("")}>
          <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 items-center w-auto">
            {notes.map((note) => (
              <Flipped key={note.id} flipId={note.id}>
                <div
                  className={cn(
                    "notification-item",
                    note.fadingOut ? "notification-exit" : "notification-enter"
                  )}
                  style={{ '--animation-duration': `${animationDuration}ms` } as React.CSSProperties}
                >
                  <Notification
                    notification={note}
                    showAvatars={showAvatars}
                    showTimestamps={showTimestamps}
                    variant={variant}
                    allowDismiss={allowDismiss}
                    onClick={() => onNotificationClick?.(note)}
                    onDismiss={() => {
                      onNotificationDismiss?.(note);
                      dismissNotification(note.id);
                    }}
                  />
                </div>
              </Flipped>
            ))}
          </div>
        </Flipper>
      </div>
    </>
  );
};

export default AnimatedNotification;

