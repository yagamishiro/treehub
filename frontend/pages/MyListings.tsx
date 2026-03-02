import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const MyListings = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = async () => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiBase}/api/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    setCsrfToken(data.csrfToken);
    fetchListings();
  };

  const fetchListings = async () => {
    try {
      const res = await fetch(`${apiBase}/api/listings/my`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const res = await fetch(`${apiBase}/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (res.ok) {
        fetchListings();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pt-20 px-4 max-w-4xl mx-auto">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-gray-900">My Listings</h1>
        <p className="text-gray-500">Manage your offerings and status.</p>
      </header>

      <div className="space-y-4">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <motion.div 
              key={listing.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center"
            >
              <div className="w-full md:w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                {listing.primary_image ? (
                  <img src={listing.primary_image} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={24} />
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold text-white uppercase rounded-full ${
                    listing.type === 'borrow' ? 'bg-blue-500' : 
                    listing.type === 'service' ? 'bg-purple-500' : 'bg-emerald-500'
                  }`}>
                    {listing.type}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                    listing.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {listing.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900">{listing.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{listing.description}</p>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(listing.created_at).toLocaleDateString()}</span>
                  <span>Qty: {listing.quantity}</span>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                {listing.status === 'available' ? (
                  <button 
                    onClick={() => handleStatusUpdate(listing.id, listing.type === 'sale' ? 'sold' : listing.type === 'borrow' ? 'borrowed' : 'unavailable')}
                    className="flex-grow md:flex-grow-0 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} />
                    Mark as {listing.type === 'sale' ? 'Sold' : listing.type === 'borrow' ? 'Borrowed' : 'Unavailable'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStatusUpdate(listing.id, 'available')}
                    className="flex-grow md:flex-grow-0 px-4 py-2 border border-gray-200 text-gray-900 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <AlertCircle size={14} />
                    Make Available
                  </button>
                )}
                <Link 
                  to={`/listing/${listing.id}`}
                  className="px-4 py-2 border border-gray-100 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  View
                </Link>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No listings yet</h3>
            <p className="text-gray-500">You haven't posted anything yet.</p>
            <Link to="/create" className="inline-block mt-4 text-primary-600 font-bold hover:underline">Create your first listing</Link>
          </div>
        )}
      </div>
    </div>
  );
};