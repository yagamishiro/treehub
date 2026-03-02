import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, MessageSquare, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useAuthStore } from '../store.js';

export const ListingDetail = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    fetch(`${apiBase}/api/csrf-token`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
    fetch(`${apiBase}/api/listings/${id}`).then(res => res.ok ? res.json() : null).then(setListing);
  }, [id]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const apiBase = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiBase}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        listing_id: listing.id,
        receiver_id: listing.user_id,
        content: message
      }),
      credentials: 'include'
    });
    if (res.ok) {
      alert('Message sent!');
      setMessage('');
      navigate('/messages');
    }
  };

  const nextImage = () => {
    if (listing?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const hasImages = listing.images && listing.images.length > 0;

  return (
    <div>
      <div className="hidden md:block h-16 w-full" />
      <div className="pb-24 pt-16 md:pt-20 px-4 max-w-4xl mx-auto">
        {/* Back button to home */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-800 font-bold px-3 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to Home</span>
        </button>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="relative aspect-square bg-gray-50 border-r border-gray-100 overflow-hidden">
              <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                  {listing.category_name}
                </span>
                <span className={`px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-full shadow-sm ${
                  listing.type === 'borrow' ? 'bg-blue-500' : 
                  listing.type === 'service' ? 'bg-purple-500' : 'bg-emerald-500'
                }`}>
                  {listing.type === 'borrow' ? 'Borrow' : 
                  listing.type === 'service' ? 'Service' : 'Sale'}
                </span>
              </div>
              {hasImages ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      style={{ position: 'absolute', zIndex: 0 }}
                    />
                  </AnimatePresence>
                  {listing.images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {listing.images.map((_: any, i: number) => (
                          <div 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-primary-600 w-4' : 'bg-gray-300'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <MapPin size={64} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-8 lg:p-10 flex flex-col">
              <div className="mb-6">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-4 inline-block">
                  {listing.category_name}
                </span>
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-3xl font-display font-bold text-gray-900 leading-tight">{listing.title}</h1>
                  <div className="text-right">
                    {listing.price > 0 && (
                      <div className="text-2xl font-bold text-primary-600 whitespace-nowrap">₱{Number(listing.price).toLocaleString('en-PH')}</div>
                    )}
                    <div className={`mt-2 px-3 py-1 text-[10px] font-bold uppercase rounded-full inline-block ${
                      listing.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {listing.status}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl overflow-hidden flex items-center justify-center text-primary-700 font-bold text-2xl border-2 border-white shadow-sm">
                  {listing.owner_image ? (
                    <img src={listing.owner_image} alt={listing.owner_name} className="w-full h-full object-cover" />
                  ) : (
                    listing.owner_name[0]
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{listing.owner_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    Tower {listing.tower} • Unit {listing.unit}
                  </div>
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <Package size={14} />
                  Quantity Available: <span className="text-gray-900">{listing.quantity}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed mb-8">{listing.description}</p>
              </div>

              {user?.id !== listing.user_id && (
                <div className="space-y-4 pt-8 border-t border-gray-100">
                  <textarea 
                    placeholder="Hi! Is this still available?"
                    className="w-full px-5 py-4 rounded-3xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all min-h-[120px] bg-gray-50/50"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Send Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
