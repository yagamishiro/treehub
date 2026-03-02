import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Clock, Package, Wrench, Printer, Smartphone, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

export const Home = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchCategories();
    fetchListings();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const res = await fetch(`${apiBase}/api/categories`);
    setCategories(await res.json());
  };

  const fetchListings = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (search) params.append('search', search);
    
    const res = await fetch(`${apiBase}/api/listings?${params.toString()}`);
    setListings(await res.json());
    setIsLoading(false);
  };

  const getCategoryIcon = (slug: string) => {
    switch(slug) {
      case 'tools': return Wrench;
      case 'printing-office': return Printer;
      case 'electronics': return Smartphone;
      case 'household-items': return Package;
      case 'services': return Briefcase;
      default: return Package;
    }
  };

  return (
    <div className="pb-24 pt-4 md:pt-20 px-4 max-w-7xl mx-auto">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-gray-900">TreeHub</h1>
        <p className="text-gray-500">Borrow. Sell. Offer Services — right here in Trees Residences.</p>
      </header>

      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search listings..." 
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchListings()}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setSelectedCategory('')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === '' ? "bg-primary-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"
            )}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all",
                selectedCategory === cat.slug ? "bg-primary-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"
              )}
            >
              {React.createElement(getCategoryIcon(cat.slug), { className: "w-4 h-4" })}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 h-64 animate-pulse border border-gray-100" />
          ))
        ) : listings.length > 0 ? (
          listings.map(listing => (
            <Link 
              key={listing.id} 
              to={`/listing/${listing.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                {listing.primary_image ? (
                  <img 
                    src={listing.primary_image} 
                    alt={listing.title} 
                    className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={48} />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
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
                  {listing.status !== 'available' && (
                    <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      {listing.status}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-2">
                  <Clock className="w-3 h-3" />
                  {new Date(listing.created_at).toLocaleDateString()}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">{listing.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{listing.description}</p>
                
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full overflow-hidden flex items-center justify-center text-primary-700 font-bold text-xs border-2 border-white shadow-sm">
                      {listing.owner_image ? (
                        <img src={listing.owner_image} alt={listing.owner_name} className="w-full h-full object-cover" />
                      ) : (
                        listing.owner_name[0]
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{listing.owner_name}</p>
                      <p className="text-[10px] text-gray-500">T{listing.tower} • U{listing.unit}</p>
                    </div>
                  </div>
                  {listing.price > 0 && (
                    <span className="text-primary-600 font-bold">₱{Number(listing.price).toLocaleString('en-PH')}</span>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No listings found</h3>
            <p className="text-gray-500">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>

      <Link 
        to="/create"
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-2xl shadow-primary-300 flex items-center justify-center hover:bg-primary-700 hover:scale-110 active:scale-95 transition-all z-40"
      >
        <PlusCircle className="w-8 h-8" />
      </Link>
    </div>
  );
};
