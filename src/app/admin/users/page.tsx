'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';

interface User {
  id: string;
  clerkId: string;
  email: string;
  username: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    liquidityPlans: number;
    minerInvestments: number;
  };
}

export default function UsersPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?page=${currentPage}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        console.error('Token expired, please login again');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      console.log('🔍 Navigating to user details for ID:', userId);
      setViewingUserId(userId);

      // Validate user ID format
      if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        console.error('❌ Invalid user ID format:', userId);
        alert('Invalid user ID format');
        setViewingUserId(null);
        return;
      }

      // Check if admin token exists
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('❌ No admin token found');
        alert('Please login again');
        setViewingUserId(null);
        return;
      }

      console.log('✅ Navigating to user details page...');

      // Add a small delay to show loading state
      setTimeout(() => {
        router.push(`/admin/user-details/${userId}`);
      }, 300);

    } catch (error) {
      console.error('❌ Error navigating to user details:', error);
      alert('Failed to navigate to user details');
    } finally {
      setViewingUserId(null);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        console.error('Token expired, please login again');
        return;
      }

      if (response.ok) {
        // Reload users to get updated data
        loadUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users Management</h1>
        <p className="text-slate-400 mt-1">Manage user accounts and permissions</p>
      </div>

      <div className="bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">All Users</h2>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Investments
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/50 divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.username || 'No username'}
                            </div>
                            <div className="text-sm text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isAdmin
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <div className="text-sm text-slate-300">
                          <div>Liquidity: {user._count?.liquidityPlans || 0}</div>
                          <div>Miner: {user._count?.minerInvestments || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          disabled={viewingUserId === user.id}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-md text-xs font-medium transition-all duration-200 inline-flex items-center gap-1.5 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                          title={`View details for ${user.username || user.email}`}
                          aria-label={`View details for user ${user.username || user.email}`}
                        >
                          {viewingUserId === user.id ? (
                            <>
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            user.isAdmin
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">No users found.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 bg-slate-700/50">
              <div className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}