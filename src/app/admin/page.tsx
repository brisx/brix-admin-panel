'use client';

import { Trophy, Users, BarChart2, Clock, DollarSign, Plus, Settings } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { usePreventRefresh } from '../../hooks/usePreventRefresh';

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn';
  rewardType: 'crypto' | 'xp' | 'badge' | 'other';
  rewardValue: string;
  requirement: string;
  totalInvestmentRequired: number;
  rewardImage: string;
  isActive: boolean;
}

interface DashboardStats {
  totalUsers: number;
  totalLiquidityPlans: number;
  totalMinerInvestments: number;
  totalInvestmentAmount: number;
  pendingCancellations: number;
  recentTransactions: any[];
}



export default function AdminDashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [cancellationRequests, setCancellationRequests] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false);
  const [isRefreshingCancellations, setIsRefreshingCancellations] = useState(false);
  const [isRefreshingAchievements, setIsRefreshingAchievements] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<{[key: string]: Date}>({});
  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({
    name: '',
    description: '',
    type: 'mercury',
    rewardType: 'crypto',
    rewardValue: '',
    requirement: '',
    totalInvestmentRequired: 0,
    rewardImage: '',
    isActive: true
  });

  // Use the prevent refresh hook
  usePreventRefresh();

  // Memoize the loadAchievements function
  const loadAchievements = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.data || []);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load achievements, dashboard stats, and cancellations on component mount
  useEffect(() => {
    loadAchievements();
    loadDashboardStats();
    loadCancellationRequests();

    // Set up real-time data polling
    const dashboardInterval = setInterval(loadDashboardStats, 30000); // Refresh every 30 seconds
    const cancellationInterval = setInterval(loadCancellationRequests, 10000); // Refresh every 10 seconds
    const achievementsInterval = setInterval(loadAchievements, 60000); // Refresh every 60 seconds

    // Cleanup intervals on unmount
    return () => {
      clearInterval(dashboardInterval);
      clearInterval(cancellationInterval);
      clearInterval(achievementsInterval);
    };
  }, [loadAchievements]);

  const loadCancellationRequests = async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshingCancellations(true);

      const token = localStorage.getItem('admin_token');

      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/cancellations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const allRequests = [
          ...data.data.liquidityRequests.map((req: any) => ({ ...req, type: 'liquidity' })),
          ...data.data.minerRequests.map((req: any) => ({ ...req, type: 'miner' }))
        ];
        setCancellationRequests(allRequests);
        setLastUpdated(prev => ({ ...prev, cancellations: new Date() }));
      }
    } catch (error) {
      console.error('Error loading cancellation requests:', error);
    } finally {
      if (showLoading) setIsRefreshingCancellations(false);
    }
  };

  const loadDashboardStats = async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshingDashboard(true);

      const token = localStorage.getItem('admin_token');

      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.data);
        setLastUpdated(prev => ({ ...prev, dashboard: new Date() }));
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      if (showLoading) setIsRefreshingDashboard(false);
    }
  };

  const handleAddAchievement = () => {
    // TODO: Implement API call to add achievement
    const newId = (achievements.length + 1).toString();
    setAchievements([...achievements, { ...newAchievement, id: newId } as Achievement]);
    setShowAddModal(false);
    setNewAchievement({
      name: '',
      description: '',
      type: 'mercury',
      rewardType: 'crypto',
      rewardValue: '',
      requirement: '',
      totalInvestmentRequired: 0,
      rewardImage: '',
      isActive: true
    });
  };

  const toggleAchievementStatus = (id: string) => {
    setAchievements(achievements.map(ach =>
      ach.id === id ? { ...ach, isActive: !ach.isActive } : ach
    ));
  };



  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-slate-400">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated.dashboard && (
              <div className="text-sm text-slate-400">
                Last updated: {lastUpdated.dashboard.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={() => loadDashboardStats(true)}
              disabled={isRefreshingDashboard}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isRefreshingDashboard ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Refreshing...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Refresh Stats
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-500'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('cancellations')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cancellations'
                ? 'border-cyan-500 text-cyan-500'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            Cancellations ({cancellationRequests.filter(req => req.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'achievements'
                ? 'border-cyan-500 text-cyan-500'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            Achievements
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats ? (
              <>
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-400">Total Users</p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-white">{dashboardStats.totalUsers}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-400">Active Liquidity Plans</p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-white">{dashboardStats.totalLiquidityPlans}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-400">Active Miner Investments</p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-white">{dashboardStats.totalMinerInvestments}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-400">Total Investment Amount</p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-white">${dashboardStats.totalInvestmentAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-4 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading dashboard statistics...</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              <button
                onClick={() => setActiveTab('achievements')}
                className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Trophy className="h-8 w-8 text-yellow-400 mb-2" />
                <span className="text-sm font-medium text-white">Manage Achievements</span>
                <span className="text-xs text-slate-400">{achievements.length} active</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/users'}
                className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Users className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-sm font-medium text-white">View Users</span>
                <span className="text-xs text-slate-400">{dashboardStats?.totalUsers || 0} total</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/analytics'}
                className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <BarChart2 className="h-8 w-8 text-purple-400 mb-2" />
                <span className="text-sm font-medium text-white">View Analytics</span>
                <span className="text-xs text-slate-400">Real-time data</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/withdrawal'}
                className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <DollarSign className="h-8 w-8 text-green-400 mb-2" />
                <span className="text-sm font-medium text-white">View Transactions</span>
                <span className="text-xs text-slate-400">${dashboardStats?.totalInvestmentAmount?.toLocaleString() || 0} invested</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/payment-settings'}
                className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Clock className="h-8 w-8 text-orange-400 mb-2" />
                <span className="text-sm font-medium text-white">Payment Settings</span>
                <span className="text-xs text-slate-400">Configure payments</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/inr-payments'}
                className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Plus className="h-8 w-8 text-cyan-400 mb-2" />
                <span className="text-sm font-medium text-white">INR Payments</span>
                <span className="text-xs text-slate-400">Review requests</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/settings'}
                className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Settings className="h-8 w-8 text-red-400 mb-2" />
                <span className="text-sm font-medium text-white">System Settings</span>
                <span className="text-xs text-slate-400">Platform config</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {dashboardStats?.recentTransactions?.slice(0, 3).map((transaction: any, index: number) => (
                <div key={transaction.id || index} className="flex items-start pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <Users className="h-5 w-5 text-slate-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white">{transaction.type || 'Transaction'}</p>
                    <p className="text-sm text-slate-400">{transaction.description || `Transaction #${transaction.id}`}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(transaction.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-slate-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : activeTab === 'cancellations' ? (
        <>
          <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Cancellation Requests</h2>
              <button
                onClick={() => loadCancellationRequests(true)}
                disabled={isRefreshingCancellations}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isRefreshingCancellations ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    Refresh
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {cancellationRequests.filter(req => req.status === 'PENDING').length === 0 ? (
                <p className="text-slate-400 text-center py-4">No pending cancellation requests.</p>
              ) : (
                cancellationRequests.filter(req => req.status === 'PENDING').map((request: any) => (
                  <div key={request.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-white">
                          {request.user?.username || request.user?.email || `User ${request.userId}`}
                        </div>
                        <div className="text-sm text-slate-400">
                          Requested on {new Date(request.requestedAt || request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      {request.liquidityPlan && (
                        <div className="text-sm text-slate-300">
                          Liquidity Plan: ${request.liquidityPlan.amount || request.amount}
                        </div>
                      )}
                      {request.minerInvestment && (
                        <div className="text-sm text-slate-300">
                          Miner Investment: ${request.minerInvestment.amount || request.amount}
                        </div>
                      )}
                      {request.type && (
                        <div className="text-sm text-slate-300 capitalize">
                          Type: {request.type}
                        </div>
                      )}
                      {request.reason && (
                        <div className="text-sm text-slate-400 mt-1">Reason: {request.reason}</div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
                        Approve
                      </button>
                      <button className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Achievements</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                {/* <Plus className="h-4 w-4 mr-2" /> */}
                Add Achievement
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Reward Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Total Investment Done To Claim This Reward</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Set Reward</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/50 divide-y divide-slate-700">
                    {achievements.map((achievement) => (
                      <tr key={achievement.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-600 mr-4">
                              {achievement.rewardImage ? (
                                <img
                                  src={achievement.rewardImage}
                                  alt={achievement.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  {/* <Trophy className="h-8 w-8" /> */}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{achievement.name}</div>
                              <div className="text-sm text-slate-400">{achievement.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-green-400">${achievement.totalInvestmentRequired}</div>
                          <div className="text-sm text-slate-400">{achievement.requirement}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-amber-400">{achievement.rewardValue}</div>
                          <div className="text-sm text-slate-400 capitalize">{achievement.rewardType}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Achievement Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
                  <h3 className="text-lg font-medium text-white mb-4">Add New Achievement</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Reward Name</label>
                      <input
                        type="text"
                        value={newAchievement.name}
                        onChange={(e) => setNewAchievement({...newAchievement, name: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                        placeholder="Achievement name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                      <textarea
                        value={newAchievement.description}
                        onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                        rows={2}
                        placeholder="Achievement description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Reward Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setNewAchievement({...newAchievement, rewardImage: e.target?.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                      />
                      {newAchievement.rewardImage && (
                        <div className="mt-2">
                          <img
                            src={newAchievement.rewardImage}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Total Investment Required ($)</label>
                      <input
                        type="number"
                        value={newAchievement.totalInvestmentRequired}
                        onChange={(e) => setNewAchievement({...newAchievement, totalInvestmentRequired: Number(e.target.value)})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                        placeholder="e.g., 100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Set Reward</label>
                      <input
                        type="text"
                        value={newAchievement.rewardValue}
                        onChange={(e) => setNewAchievement({...newAchievement, rewardValue: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                        placeholder="e.g., 100 BRX"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                        <select
                          value={newAchievement.type}
                          onChange={(e) => setNewAchievement({...newAchievement, type: e.target.value as any})}
                          className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                        >
                          <option value="mercury">Mercury</option>
                          <option value="venus">Venus</option>
                          <option value="earth">Earth</option>
                          <option value="mars">Mars</option>
                          <option value="jupiter">Jupiter</option>
                          <option value="saturn">Saturn</option>
                          <option value="uranus">Uranus</option>
                          <option value="neptune">Neptune</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Reward Type</label>
                        <select
                          value={newAchievement.rewardType}
                          onChange={(e) => setNewAchievement({...newAchievement, rewardType: e.target.value as any})}
                          className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                        >
                          <option value="crypto">Crypto</option>
                          <option value="xp">XP</option>
                          <option value="badge">Badge</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Requirement</label>
                      <input
                        type="text"
                        value={newAchievement.requirement}
                        onChange={(e) => setNewAchievement({...newAchievement, requirement: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                        placeholder="e.g., Deposit $100"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={newAchievement.isActive}
                        onChange={(e) => setNewAchievement({...newAchievement, isActive: e.target.checked})}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-600 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-slate-300">
                        Active
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-slate-600 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddAchievement}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      Add Achievement
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
