import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Camera, Loader2, Package } from 'lucide-react';
import { useAuthStore } from '../store.js';

export const Profile = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const { user, setUser, logout } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    fetch(`${apiBase}/api/csrf-token`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiBase}/api/auth/update-profile`, {
        method: 'PATCH',
        body: formData,
        headers: {
          'CSRF-Token': csrfToken
        },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        alert("Failed to update profile image");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 md:pt-20 px-4 max-w-3xl mx-auto">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">Manage your account and preferences.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-6">
        <div className="bg-primary-600 h-32 relative">
          {/* Background decoration or image could go here */}
        </div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 inline-block">
            <div className="w-32 h-32 bg-white rounded-3xl p-1 shadow-2xl relative group">
              <div className="w-full h-full bg-primary-100 rounded-2xl overflow-hidden flex items-center justify-center text-primary-700 text-4xl font-bold border-4 border-white">
                {user.profile_image_url ? (
                  <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name[0]
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} />
              </label>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500 mb-6">{user.email}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Tower</p>
              <p className="text-lg font-bold text-gray-900">{user.tower}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Unit</p>
              <p className="text-lg font-bold text-gray-900">{user.unit}</p>
            </div>
          </div>

          <Link 
            to="/my-listings"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-50 text-gray-900 font-bold hover:bg-gray-100 transition-all mb-4"
          >
            <Package className="w-5 h-5" />
            My Listings
          </Link>

          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
