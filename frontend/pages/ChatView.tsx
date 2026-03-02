import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, MessageSquare, Image as ImageIcon, X, Send } from 'lucide-react';
import { useAuthStore } from '../store.js';
import { cn } from '../lib/utils.js';

export const ChatView = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { listingId, otherUserId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    // Fetch CSRF token on mount
    fetch(`${apiBase}/api/csrf-token`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
    fetch(`${apiBase}/api/listings/${listingId}`).then(res => res.json()).then(setListing);
    const fetchMessages = async () => {
      const res = await fetch(`${apiBase}/api/messages/${listingId}/${otherUserId}`);
      if (res.ok) setMessages(await res.json());
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [listingId, otherUserId]);

  // Track if user is at the bottom (using ref for accuracy)
  const isAtBottomRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const manualScrollRef = useRef(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Consider at bottom if within 40px of the bottom
      const atBottom = scrollHeight - scrollTop - clientHeight < 40;
      isAtBottomRef.current = atBottom;
      setIsAtBottom(atBottom);
      // If user scrolls up, set manualScrollRef to true
      if (!atBottom) manualScrollRef.current = true;
      // If user returns to bottom, reset manualScrollRef
      if (atBottom) manualScrollRef.current = false;
    };
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Track if a message was just sent by the user
  const [justSent, setJustSent] = useState(false);

  // Auto-scroll on initial mount, after sending a message, or when not manually scrolling up
  useEffect(() => {
    if ((justSent || !manualScrollRef.current) && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setJustSent(false);
    }
  }, [messages, justSent]);

  // Initialize emoji picker
  useEffect(() => {
    if (showEmojiPicker && pickerRef.current) {
      import('emoji-mart').then(({ Picker }) => {
        if (pickerRef.current && !pickerRef.current.hasChildNodes()) {
          new Picker({
            onEmojiSelect: handleEmojiSelect,
            theme: 'light',
            parent: pickerRef.current,
          });
        }
      });
    }
  }, [showEmojiPicker]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;
    
    setIsSending(true);
    const formData = new FormData();
    formData.append('listing_id', listingId!);
    formData.append('receiver_id', otherUserId!);
    formData.append('content', newMessage);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      const res = await fetch(`${apiBase}/api/messages`, {
        method: 'POST',
        body: formData,
        headers: {
          'CSRF-Token': csrfToken
        },
        credentials: 'include'
      });
      
      if (res.ok) {
        setNewMessage('');
        clearImage();
        setJustSent(true);
        const updated = await fetch(`${apiBase}/api/messages/${listingId}/${otherUserId}`);
        setMessages(await updated.json());
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!listing) return null;

  return (
    <div>
      <div className="hidden md:block h-16 w-full" />
      <div className="pb-24 pt-8 md:pt-20 px-6 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        <div className="bg-white p-4 rounded-t-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <Link to="/messages" className="p-2 hover:bg-gray-50 rounded-full">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </Link>
          {/* Sender avatar and name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full overflow-hidden flex items-center justify-center text-primary-700 font-bold text-lg border-2 border-white shadow-sm">
              {messages.find(m => m.sender_id != user?.id)?.sender_profile_image_url ? (
                <img src={messages.find(m => m.sender_id != user?.id)?.sender_profile_image_url} alt={messages.find(m => m.sender_id != user?.id)?.sender_name} className="w-full h-full object-cover" />
              ) : (
                messages.find(m => m.sender_id != user?.id)?.sender_name ? messages.find(m => m.sender_id != user?.id)?.sender_name[0] : '?'
              )}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{messages.find(m => m.sender_id != user?.id)?.sender_name || 'Chat'}</h2>
              <p className="text-xs text-primary-600 font-medium">Re: {listing.title}</p>
            </div>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4 border-x border-gray-100"
        >
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "items-start"
                )}
              >
                <div 
                  className={cn(
                    "px-4 py-2 rounded-2xl text-sm shadow-sm flex flex-col gap-2",
                    isMe ? "bg-primary-600 text-white rounded-tr-none" : "bg-white text-gray-900 rounded-tl-none border border-gray-100"
                  )}
                >
                  {msg.image_url && (
                    <img 
                      src={msg.image_url} 
                      alt="Sent image" 
                      className="w-24 h-24 object-cover rounded-lg shadow-sm cursor-pointer" 
                      referrerPolicy="no-referrer"
                      onClick={() => setModalImage(msg.image_url)}
                    />
                  )}
                  {msg.content && msg.content !== "[Image]" && (
                    <p>{msg.content}</p>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        {imagePreview && (
          <div className="bg-white p-4 border-x border-gray-100 relative">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
              <button 
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Modal for large image */}
        {modalImage && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <button 
              onClick={() => setModalImage(null)}
              className="absolute top-6 right-6 bg-white text-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              aria-label="Close image preview"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={modalImage} alt="Large message" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl" />
          </div>,
          document.body
        )}

        <form onSubmit={handleSend} className="bg-white p-4 rounded-b-3xl border border-gray-100 flex gap-2 shadow-sm items-center relative">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <ImageIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(v => !v)}
            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
            aria-label="Add emoji"
          >
            <span role="img" aria-label="emoji">😊</span>
          </button>
          {showEmojiPicker && (
            <div ref={pickerRef} className="absolute bottom-16 left-0 z-50" />
          )}
          <input 
            type="text" 
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            disabled={isSending}
          />
          <button 
            type="submit"
            disabled={isSending || (!newMessage.trim() && !selectedImage)}
            className={cn(
              "bg-primary-600 text-white p-2 rounded-xl transition-all",
              (isSending || (!newMessage.trim() && !selectedImage)) ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-700"
            )}
          >
            {isSending ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
