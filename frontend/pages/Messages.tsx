import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store';
import { cn } from '../lib/utils';

export const Messages = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    fetch(`${apiBase}/api/messages`).then(res => res.json()).then(setConversations);
  }, []);

  return (
    <div className="pb-24 pt-4 md:pt-20 px-4 max-w-3xl mx-auto">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500">Your private conversations with neighbors.</p>
      </header>

      <div className="space-y-4">
        {conversations.length > 0 ? (
          conversations.map((conv: any, i: number) => (
            <Link 
              key={i}
              to={`/chat/${conv.listing_id}/${conv.other_user_id}`}
              className={cn(
                "block bg-white p-6 rounded-3xl border transition-all relative",
                conv.unread_count > 0 ? "border-primary-200 bg-primary-50/30 shadow-md" : "border-gray-100 shadow-sm hover:shadow-md"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{conv.other_user_name}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    T{conv.tower} U{conv.unit}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(conv.last_message_at).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-primary-600 font-medium mb-2">Re: {conv.listing_title}</p>
              <p className={cn(
                "text-sm line-clamp-1",
                conv.unread_count > 0 ? "text-gray-900 font-semibold" : "text-gray-500"
              )}>
                {conv.last_message}
              </p>
              {conv.unread_count > 0 && (
                <div className="absolute top-6 right-6 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                  {conv.unread_count}
                </div>
              )}
            </Link>
          ))
        ) : (
          <div className="py-20 text-center">
            <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No messages yet</h3>
            <p className="text-gray-500">Start a conversation by messaging a listing owner.</p>
          </div>
        )}
      </div>
    </div>
  );
};
