'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      console.log('Admin: Attempting login with credentials:', loginCredentials);
      console.log('Admin: API URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginCredentials),
      });

      console.log('Admin: Login response status:', response.status);
      const data = await response.json();
      console.log('Admin: Login response data:', data);

      if (response.ok && data.success) {
        console.log('Admin: Login successful, token received:', data.data.token);
        console.log('Admin: Token type:', typeof data.data.token);
        console.log('Admin: Token length:', data.data.token?.length);

        // Validate token format before storing
        if (data.data.token && typeof data.data.token === 'string') {
          const tokenParts = data.data.token.split('.');
          console.log('Admin: Token parts:', tokenParts.length);

          if (tokenParts.length === 3) {
            localStorage.setItem('admin_token', data.data.token);
            console.log('Admin: Token stored successfully');
            setIsAuthenticated(true);
            setLoginCredentials({ username: '', password: '' });
          } else {
            console.log('Admin: Invalid token format received');
            setLoginError('Invalid token format received from server');
          }
        } else {
          console.log('Admin: No valid token in response');
          setLoginError('No token received from server');
        }
      } else {
        console.log('Admin: Login failed:', data.error || 'Unknown error');
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      console.log('Admin: Login error:', err);
      setLoginError('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-900 text-slate-100 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-slate-800/50 rounded-lg p-8 w-full max-w-md border border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Admin Login</h2>
            <p className="text-slate-400 mt-2">Please sign in to access the admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={loginCredentials.username}
                onChange={(e) => setLoginCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={loginCredentials.password}
                onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                <p className="text-red-400 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              {loginLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-400">
            <p>Default credentials: admin / admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <AdminNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-800/50 border-b border-slate-700 p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">BRiX Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">Admin</span>
            <button
              onClick={() => {
                localStorage.removeItem('admin_token');
                setIsAuthenticated(false);
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
