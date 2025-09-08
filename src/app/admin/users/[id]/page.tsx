'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Copy, ExternalLink, Wallet, TrendingUp, Users, DollarSign } from 'lucide-react';

interface UserDetail {
  id: string;
  clerkId: string;
  email: string;
  username: string | null;
  walletAddress: string | null;
  brixsWalletAddress: string | null;
  referralCode: string;
  isAdmin: boolean;
  totalEarned: number;
  totalInvested: number;
  totalWithdrawn: number;
  totalReferralEarnings: number;
  brixBalance: number;
  usdtBalance: number;
  createdAt: string;
  updatedAt: string;
  liquidityPlans: any[];
  minerInvestments: any[];
  transactions: any[];
  withdrawals: any[];
  referrals: any[];
  statistics: {
    totalLiquidityInvested: number;
    totalMinerInvested: number;
    totalInvested: number;
    totalReferralEarnings: number;
    activePlans: number;
    activeInvestments: number;
    totalReferrals: number;
  };
}

export default function UserDetailPage() {
  const { getToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params?.id) {
      loadUserDetails();
    }
  }, [params?.id]);

  const loadUserDetails = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      console.log('🔍 Frontend: Loading user details for ID:', params?.id);
      console.log('🌐 API URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${params?.id}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${params?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        console.error('Token expired, please login again');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Frontend: User data received:', data);
        setUser(data.data);
      } else {
        const errorText = await response.text();
        console.log('❌ Frontend: API error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">User not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user.username || user.email}
          </h1>
          <p className="text-slate-400 mt-1">User ID: {user.id}</p>
        </div>
      </div>

      {/* User Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-slate-400">Total Invested</p>
              <p className="text-2xl font-bold text-white">${user.statistics.totalInvested.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-slate-400">Total Earned</p>
              <p className="text-2xl font-bold text-white">${user.totalEarned.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Total Referrals</p>
              <p className="text-2xl font-bold text-white">{user.statistics.totalReferrals}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <Wallet className="h-8 w-8 text-cyan-500" />
            <div>
              <p className="text-sm text-slate-400">USDT Balance</p>
              <p className="text-2xl font-bold text-white">${user.usdtBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'wallets', label: 'Wallets' },
            { id: 'investments', label: 'Investments' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'referrals', label: 'Referrals' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Username</label>
                  <p className="text-white">{user.username || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Role</label>
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.isAdmin ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Joined</label>
                  <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Referral Code</label>
                  <div className="flex items-center gap-2">
                    <p className="text-white">{user.referralCode}</p>
                    <button
                      onClick={() => copyToClipboard(user.referralCode)}
                      className="p-1 hover:bg-slate-600 rounded"
                    >
                      <Copy className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Liquidity Plans</span>
                  <span className="text-white">{user.statistics.activePlans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Miner Investments</span>
                  <span className="text-white">{user.statistics.activeInvestments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Withdrawn</span>
                  <span className="text-white">${user.totalWithdrawn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Referral Earnings</span>
                  <span className="text-white">${user.statistics.totalReferralEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BRIX Balance</span>
                  <span className="text-white">{user.brixBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wallets' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* USDT Wallet */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-500" />
                USDT Wallet
              </h3>
              {user.walletAddress ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-400">Wallet Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-slate-700 px-3 py-2 rounded text-sm text-white flex-1 break-all">
                        {user.walletAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(user.walletAddress!)}
                        className="p-2 bg-slate-600 hover:bg-slate-500 rounded"
                      >
                        <Copy className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Balance</span>
                    <span className="text-white font-semibold">${user.usdtBalance.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No USDT wallet connected</p>
              )}
            </div>

            {/* BRIX Wallet */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-cyan-500" />
                BRIX Wallet
              </h3>
              {user.brixsWalletAddress ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-400">Wallet Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-slate-700 px-3 py-2 rounded text-sm text-white flex-1 break-all">
                        {user.brixsWalletAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(user.brixsWalletAddress!)}
                        className="p-2 bg-slate-600 hover:bg-slate-500 rounded"
                      >
                        <Copy className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Balance</span>
                    <span className="text-white font-semibold">{user.brixBalance.toFixed(2)} BRIX</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No BRIX wallet connected</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="space-y-6">
            {/* Liquidity Plans */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Liquidity Plans</h3>
              {user.liquidityPlans.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Plan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">APY</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {user.liquidityPlans.map((plan: any) => (
                        <tr key={plan.id}>
                          <td className="px-4 py-3 text-sm text-white">{plan.name}</td>
                          <td className="px-4 py-3 text-sm text-white">${plan.amount}</td>
                          <td className="px-4 py-3 text-sm text-white">{plan.apy}%</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              plan.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {plan.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-400">
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400">No liquidity plans found</p>
              )}
            </div>

            {/* Miner Investments */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Miner Investments</h3>
              {user.minerInvestments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">APY</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Maturity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {user.minerInvestments.map((investment: any) => (
                        <tr key={investment.id}>
                          <td className="px-4 py-3 text-sm text-white">{investment.minerType}</td>
                          <td className="px-4 py-3 text-sm text-white">${investment.amount}</td>
                          <td className="px-4 py-3 text-sm text-white">{investment.apy}%</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              investment.status === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                            }`}>
                              {investment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-400">
                            {new Date(investment.maturityDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400">No miner investments found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
            {user.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Token</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {user.transactions.map((transaction: any) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-3 text-sm text-white">{transaction.type}</td>
                        <td className="px-4 py-3 text-sm text-white">${transaction.amount}</td>
                        <td className="px-4 py-3 text-sm text-white">{transaction.token}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.status === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400">No transactions found</p>
            )}
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Referrals</h3>
            {user.referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Invested</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {user.referrals.map((referral: any) => (
                      <tr key={referral.id}>
                        <td className="px-4 py-3 text-sm text-white">{referral.username || 'No username'}</td>
                        <td className="px-4 py-3 text-sm text-white">{referral.email}</td>
                        <td className="px-4 py-3 text-sm text-white">${referral.totalInvested}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400">No referrals found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}