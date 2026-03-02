import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuthStore, useConfigStore } from '../store.js';

export const Login = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isRegister, setIsRegister] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tower, setTower] = useState('');
  const [unit, setUnit] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { setUser } = useAuthStore();
  const { flags } = useConfigStore();
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetch(`${apiBase}/api/csrf-token`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { name, email, password, tower, unit } : { email, password };
    
    const res = await fetch(`${apiBase}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      if (flags?.enable_email_verification && data.user.is_verified === 0) {
        setIsVerifying(true);
      } else {
        navigate('/');
      }
    } else {
      const data = await res.json();
      alert(data.error || 'Authentication failed');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiBase = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiBase}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ code: verificationCode }),
      credentials: 'include'
    });
    
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      navigate('/');
    } else {
      const data = await res.json();
      alert(data.error || 'Verification failed');
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-primary-100"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900">Verify Email</h2>
            <p className="text-gray-500 mt-2">We've sent a 6-digit code to your email.</p>
          </div>
          <form onSubmit={handleVerify} className="space-y-4">
            <input 
              type="text" placeholder="Enter 6-digit code" required
              maxLength={6}
              className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={verificationCode} onChange={e => setVerificationCode(e.target.value)}
            />
            <button 
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-95"
            >
              Verify Account
            </button>
            <button 
              type="button"
              onClick={() => setIsVerifying(false)}
              className="w-full text-gray-500 text-sm font-medium hover:underline"
            >
              Back to Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-primary-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-primary-200">
            T
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">TreeHub</h1>
          <p className="text-gray-500 mt-2">Borrow. Sell. Offer Services — right here in Trees Residences.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input 
                type="text" placeholder="Full Name" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                value={name} onChange={e => setName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Tower (e.g. 1)" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  value={tower} onChange={e => setTower(e.target.value)}
                />
                <input 
                  type="text" placeholder="Unit (e.g. 123)" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  value={unit} onChange={e => setUnit(e.target.value)}
                />
              </div>
            </>
          )}
          <input 
            type="email" placeholder="Email Address" required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button 
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-95"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary-600 font-bold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
