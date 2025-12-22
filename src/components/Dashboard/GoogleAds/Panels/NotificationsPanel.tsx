"use client";

import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

const NotificationsPanel: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'ROAS Target Achieved',
      message: 'Shopping campaigns exceeded target ROAS of 4.0',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '2',
      type: 'warning',
      title: 'Budget Alert',
      message: 'Campaign "Summer Sale" is 80% through daily budget',
      timestamp: new Date(Date.now() - 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'info',
      title: 'Performance Update',
      message: 'CTR increased by 15% compared to last week',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <X className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all backdrop-blur-sm"
      >
        <Bell className="w-5 h-5 text-primary-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-[#0c1427] border border-gray-100 dark:border-[#172036] rounded-xl shadow-2xl z-50 max-h-[500px] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-[#0c1427] p-4 border-b border-gray-100 dark:border-[#172036]">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900 dark:text-white font-semibold">{isRTL ? 'الإشعارات' : 'Notifications'}</h3>
                <button onClick={() => setNotifications([])} className="text-xs text-primary-500 hover:text-primary-600">
                  {isRTL ? 'مسح الكل' : 'Clear All'}
                </button>
              </div>
            </div>

            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>{isRTL ? 'لا توجد إشعارات' : 'No notifications'}</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors mb-2"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-gray-900 dark:text-white font-medium text-sm">{notif.title}</p>
                          <button
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{notif.message}</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">{getTimeAgo(notif.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPanel;

