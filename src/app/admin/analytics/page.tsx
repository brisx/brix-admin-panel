'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BarChart2, Users, DollarSign, TrendingUp, Calendar, Activity } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalInvestment: number;
  totalRevenue: number;
  monthlyGrowth: number;
  topInvestors: Array<{
    user: { username: string | null; email: string };
    totalInvested: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    createdAt: string;
    user: { username: string | null; email: string };
  }>;
  investmentByMonth: Array<{
    month: string;
    amount: number;
  }>;
}

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`, {
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
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-slate-400 mt-1">Comprehensive analytics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Users</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-white">{analytics?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Active Users</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-white">{analytics?.activeUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Investment</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-white">${analytics?.totalInvestment?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Monthly Growth</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-white">+{analytics?.monthlyGrowth || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Investors */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Investors</h3>
          <div className="space-y-4">
            {analytics?.topInvestors?.slice(0, 5).map((investor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium text-white">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {investor.user?.username || investor.user?.email || 'Unknown User'}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-400">
                  ${investor.totalInvested.toLocaleString()}
                </div>
              </div>
            )) || (
              <p className="text-slate-400 text-center py-4">No investment data available</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {analytics?.recentTransactions?.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {transaction.user?.username || transaction.user?.email || 'Unknown User'}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">{transaction.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">
                    ${transaction.amount}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-slate-400 text-center py-4">No recent transactions</p>
            )}
          </div>
        </div>
      </div>

      {/* Investment Trends */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Investment Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {analytics?.investmentByMonth?.slice(0, 6).map((month, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-slate-400 mb-1">{month.month}</div>
              <div className="text-lg font-semibold text-white">${month.amount.toLocaleString()}</div>
            </div>
          )) || (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-400">No investment trend data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <BarChart2 className="h-4 w-4" />
          Refresh Analytics
        </button>
      </div>
    </div>
  );
}