import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Bell, 
  User, 
  LogOut, 
  Home as HomeIcon, 
  List as ListIcon
} from 'lucide-react';
import { useAuthStore } from '../store.js';
import { cn } from '../lib/utils.js';
import { authFetch } from '../lib/authFetch';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCounts, setUnreadCounts] = useState({ notifications: 0, messages: 0 });

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        const apiBase = import.meta.env.VITE_API_URL || '';
        const res = await authFetch(`${apiBase}/api/notifications/unread-count`);
        if (res.ok) setUnreadCounts(await res.json());
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navItems = [
    { icon: HomeIcon, label: 'Home', path: '/', badge: 0 },
    { icon: MessageSquare, label: 'Messages', path: '/messages', badge: unreadCounts.messages },
    { icon: Bell, label: 'Alerts', path: '/notifications', badge: unreadCounts.notifications },
    { icon: ListIcon, label: 'My Listings', path: '/my-listings', badge: 0 },
    { icon: User, label: 'Profile', path: '/profile', badge: 0 },
  ];

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="hidden md:flex items-center gap-2 text-primary-700 font-display font-bold text-xl">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">T</div>
          TreeHub
        </Link>
        
        <div className="flex justify-around w-full md:w-auto md:gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors relative",
                  isActive ? "text-primary-600" : "text-gray-500 hover:text-primary-500"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "fill-primary-100")} />
                <span className="text-[10px] font-medium md:text-sm">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="hidden md:flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};
