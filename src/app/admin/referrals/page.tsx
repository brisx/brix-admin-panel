'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Trophy,
  Settings,
  BarChart3,
  Network
} from 'lucide-react';
import { ReferralRewardsManagement } from '@/components/admin/referral-rewards-management';
import { ReferralAnalytics } from '@/components/admin/referral-analytics';
import { ReferralNetwork } from '@/components/admin/referral-network';
import { ReferralSettings } from '@/components/admin/referral-settings';
import { ReferralLeaderboard } from '@/components/admin/referral-leaderboard';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalRewards: number;
  pendingRewards: number;
  completedLevels: number;
  totalEarnings: number;
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('No admin token found');
        return;
      }

      const response = await fetch('https://brixs-backend.up.railway.app/api/admin/referral-rewards/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading referral stats:', error);
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
      <div>
        <h1 className="text-2xl font-bold text-white">Referral Management</h1>
        <p className="text-slate-400 mt-1">Manage referral rewards, analytics, and network</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-slate-400">
              {stats?.activeReferrals || 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pending Rewards</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.pendingRewards || 0}</div>
            <p className="text-xs text-slate-400">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalRewards || 0}</div>
            <p className="text-xs text-slate-400">
              ${stats?.totalEarnings?.toLocaleString() || 0} earned
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Level Completions</CardTitle>
            <Trophy className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.completedLevels || 0}</div>
            <p className="text-xs text-slate-400">
              Users completed levels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-cyan-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="network" className="data-[state=active]:bg-cyan-600">
            <Network className="h-4 w-4 mr-2" />
            Network
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-600">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription>Latest referral activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">New referral reward created</p>
                      <p className="text-xs text-slate-400">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">Level 2 completion achieved</p>
                      <p className="text-xs text-slate-400">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">USDT reward approved</p>
                      <p className="text-xs text-slate-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription>Common referral management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                  onClick={() => setActiveTab('rewards')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Pending Rewards
                </Button>
                <Button 
                  className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                  onClick={() => setActiveTab('analytics')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button 
                  className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                  onClick={() => setActiveTab('network')}
                >
                  <Network className="h-4 w-4 mr-2" />
                  Explore Network
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards">
          <ReferralRewardsManagement onStatsUpdate={loadReferralStats} />
        </TabsContent>

        <TabsContent value="analytics">
          <ReferralAnalytics />
        </TabsContent>

        <TabsContent value="network">
          <ReferralNetwork />
        </TabsContent>

        <TabsContent value="settings">
          <ReferralSettings onSettingsUpdate={loadReferralStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
