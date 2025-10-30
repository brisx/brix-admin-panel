'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, Users, DollarSign, Target, Award, Activity } from 'lucide-react';

interface ReferralAnalyticsData {
  totalReferrals: number;
  activeReferrals: number;
  totalRewards: number;
  totalEarnings: number;
  levelCompletions: {
    level1: number;
    level2: number;
    level3: number;
  };
  monthlyGrowth: Array<{
    month: string;
    referrals: number;
    rewards: number;
    earnings: number;
  }>;
  topReferrers: Array<{
    user: { username: string | null; email: string };
    referrals: number;
    earnings: number;
  }>;
  rewardDistribution: {
    directReferral: number;
    levelCompletion: number;
  };
}

export function ReferralAnalytics() {
  const [analytics, setAnalytics] = useState<ReferralAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        console.error('No admin token found');
        return;
      }

      const response = await fetch('https://brixs-backend.up.railway.app/api/admin/referral-analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading referral analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.totalReferrals || 0}</div>
            <p className="text-xs text-slate-400">
              {analytics?.activeReferrals || 0} active users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Rewards</CardTitle>
            <Award className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.totalRewards || 0}</div>
            <p className="text-xs text-slate-400">
              ${analytics?.totalEarnings?.toLocaleString() || 0} earned
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Level 1 Completions</CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.levelCompletions.level1 || 0}</div>
            <p className="text-xs text-slate-400">
              {analytics?.levelCompletions.level2 || 0} Level 2, {analytics?.levelCompletions.level3 || 0} Level 3
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics?.totalReferrals ? Math.round((analytics.activeReferrals / analytics.totalReferrals) * 100) : 0}%
            </div>
            <p className="text-xs text-slate-400">
              Active vs total referrals
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Monthly Growth Trends</CardTitle>
            <CardDescription className="text-slate-400">
              Referral activity over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.monthlyGrowth?.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{month.month}</span>
                      <span className="text-white">{month.referrals} referrals</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{
                          width: `${Math.max(10, (month.referrals / Math.max(...analytics.monthlyGrowth.map(m => m.referrals))) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-slate-400 text-center py-4">No growth data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reward Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Reward Distribution</CardTitle>
            <CardDescription className="text-slate-400">
              Breakdown of reward types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-slate-400">Direct Referrals</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{analytics?.rewardDistribution.directReferral || 0}</div>
                  <div className="text-xs text-slate-400">rewards</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-400">Level Completions</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{analytics?.rewardDistribution.levelCompletion || 0}</div>
                  <div className="text-xs text-slate-400">rewards</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Top Referrers</CardTitle>
          <CardDescription className="text-slate-400">
            Users with the most successful referrals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.topReferrers?.slice(0, 10).map((referrer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {referrer.user?.username || referrer.user?.email || 'Unknown User'}
                    </p>
                    <p className="text-sm text-slate-400">{referrer.referrals} referrals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-400">${referrer.earnings.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">earned</p>
                </div>
              </div>
            )) || (
              <p className="text-slate-400 text-center py-4">No referrer data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Level Completion Stats */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Level Completion Statistics</CardTitle>
          <CardDescription className="text-slate-400">
            Progress through referral program levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">Level 1</div>
              <div className="text-2xl font-semibold text-white">{analytics?.levelCompletions.level1 || 0}</div>
              <p className="text-sm text-slate-400">Completions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">Level 2</div>
              <div className="text-2xl font-semibold text-white">{analytics?.levelCompletions.level2 || 0}</div>
              <p className="text-sm text-slate-400">Completions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">Level 3</div>
              <div className="text-2xl font-semibold text-white">{analytics?.levelCompletions.level3 || 0}</div>
              <p className="text-sm text-slate-400">Completions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}