import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { cn } from '../lib/utils.js';

export const Notifications = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    fetch(`${apiBase}/api/csrf-token`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
    fetch(`${apiBase}/api/notifications`).then(res => res.json()).then(setNotifications);
    // Mark as read
    fetch(`${apiBase}/api/notifications/read`, { method: 'PATCH', headers: { 'CSRF-Token': csrfToken }, credentials: 'include' });
  }, []);

  return (
    <div className="pb-24 pt-4 md:pt-20 px-4 max-w-3xl mx-auto">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500">Stay updated on your activity.</p>
      </header>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif: any) => {
            const data = JSON.parse(notif.data);
            return (
              <div 
                key={notif.id}
                className={cn(
                  "p-6 rounded-3xl border transition-all flex gap-4",
                  notif.is_read ? "bg-white border-gray-100" : "bg-primary-50 border-primary-100 shadow-sm"
                )}
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm relative">
                  <Bell className="w-6 h-6 text-primary-600" />
                  {!notif.is_read && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {notif.type === 'message_received' ? (
                      <>New message from <span className="font-bold">{data.sender_name}</span></>
                    ) : notif.type}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                  <Link 
                    to={notif.type === 'message_received' ? `/chat/${data.listing_id}/${data.sender_id || ''}` : '#'}
                    className="text-primary-600 text-xs font-bold mt-2 inline-block hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
            <p className="text-gray-500">No new notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
