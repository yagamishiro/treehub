import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore, useConfigStore } from './store';

// Components
import { Navbar } from './components/Navbar';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ListingDetail } from './pages/ListingDetail';
import { CreateListing } from './pages/CreateListing';
import { Messages } from './pages/Messages';
import { ChatView } from './pages/ChatView';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { MyListings } from './pages/MyListings';

export default function App() {
  const { user, setUser, isLoading } = useAuthStore();
  const { flags, fetchFlags } = useConfigStore();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data.user);
        else setUser(null);
      });
    fetchFlags();
  }, []);

  if (isLoading || !flags) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAuth = user && (flags.enable_email_verification ? user.is_verified === 1 : true);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Navbar />
        <main className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={isAuth ? <Home /> : <Login />} />
            <Route path="/listing/:id" element={isAuth ? <ListingDetail /> : <Login />} />
            <Route path="/create" element={isAuth ? <CreateListing /> : <Login />} />
            <Route path="/messages" element={isAuth ? <Messages /> : <Login />} />
            <Route path="/chat/:listingId/:otherUserId" element={isAuth ? <ChatView /> : <Login />} />
            <Route path="/notifications" element={isAuth ? <Notifications /> : <Login />} />
            <Route path="/profile" element={isAuth ? <Profile /> : <Login />} />
            <Route path="/my-listings" element={isAuth ? <MyListings /> : <Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
