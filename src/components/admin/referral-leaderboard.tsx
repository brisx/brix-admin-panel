'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Trophy, Medal, Award, TrendingUp, Users, DollarSign, Crown } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string | null;
    email: string;
  };
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  level1Earnings: number;
  level2Earnings: number;
  level3Earnings: number;
  currentLevel: number;
  levelCompletions: number;
  joinDate: string;
}

interface ReferralLeaderboardProps {
  timeRange?: 'week' | 'month' | 'all';
}

export function ReferralLeaderboard({ timeRange = 'all' }: ReferralLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);

  useEffect(() => {
    loadLeaderboard();
  }, [currentTimeRange]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        console.error('No admin token found');
        return;
      }

      const response = await fetch(`https://brixs-backend.up.railway.app/api/admin/referral-leaderboard?timeRange=${currentTimeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.data || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-slate-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <Badge className={`${
          rank === 1 ? 'bg-yellow-500 text-yellow-900' :
          rank === 2 ? 'bg-gray-400 text-gray-900' :
          'bg-amber-600 text-amber-900'
        }`}>
          Top {rank}
        </Badge>
      );
    }
    return null;
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
      {/* Header and Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5" />
            Referral Leaderboard
          </CardTitle>
          <CardDescription className="text-slate-400">
            Top performers in the referral program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['week', 'month', 'all'].map((range) => (
              <Button
                key={range}
                variant={currentTimeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTimeRange(range as any)}
                className={currentTimeRange === range
                  ? 'bg-cyan-600 hover:bg-cyan-700'
                  : 'border-slate-600 text-slate-400 hover:bg-slate-700'
                }
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Top Performers</CardTitle>
            <CardDescription className="text-slate-400">
              The top 3 referral champions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {/* 2nd Place */}
              <div className="text-center order-1">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    {getRankIcon(2)}
                  </div>
                  <div className="absolute -top-2 -right-2">
                    {getRankBadge(2)}
                  </div>
                </div>
                <div className="font-medium text-white text-sm">
                  {leaderboard[1]?.user.username || leaderboard[1]?.user.email}
                </div>
                <div className="text-xs text-slate-400">
                  {leaderboard[1]?.totalReferrals} referrals
                </div>
                <div className="text-sm font-bold text-green-400">
                  ${leaderboard[1]?.totalEarnings.toLocaleString()}
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center order-2">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    {getRankIcon(1)}
                  </div>
                  <div className="absolute -top-2 -right-2">
                    {getRankBadge(1)}
                  </div>
                </div>
                <div className="font-medium text-white text-base">
                  {leaderboard[0]?.user.username || leaderboard[0]?.user.email}
                </div>
                <div className="text-xs text-slate-400">
                  {leaderboard[0]?.totalReferrals} referrals
                </div>
                <div className="text-lg font-bold text-green-400">
                  ${leaderboard[0]?.totalEarnings.toLocaleString()}
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center order-3">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                    {getRankIcon(3)}
                  </div>
                  <div className="absolute -top-2 -right-2">
                    {getRankBadge(3)}
                  </div>
                </div>
                <div className="font-medium text-white text-sm">
                  {leaderboard[2]?.user.username || leaderboard[2]?.user.email}
                </div>
                <div className="text-xs text-slate-400">
                  {leaderboard[2]?.totalReferrals} referrals
                </div>
                <div className="text-sm font-bold text-green-400">
                  ${leaderboard[2]?.totalEarnings.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Full Leaderboard</CardTitle>
          <CardDescription className="text-slate-400">
            Complete ranking of all referral participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No leaderboard data available</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    entry.rank <= 3
                      ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/50 border-slate-600'
                      : 'bg-slate-700/30 border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {entry.user.username || entry.user.email}
                      </div>
                      <div className="text-sm text-slate-400">
                        Level {entry.currentLevel} • {entry.levelCompletions} completions
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-blue-400">
                        {entry.totalReferrals}
                      </div>
                      <div className="text-xs text-slate-400">Referrals</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium text-green-400">
                        ${entry.totalEarnings.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">Earned</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium text-purple-400">
                        L{entry.currentLevel}
                      </div>
                      <div className="text-xs text-slate-400">Level</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{leaderboard.length}</div>
            <p className="text-xs text-slate-400">
              Active in referral program
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Average Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${leaderboard.length > 0
                ? Math.round(leaderboard.reduce((acc, entry) => acc + entry.totalEarnings, 0) / leaderboard.length).toLocaleString()
                : 0
              }
            </div>
            <p className="text-xs text-slate-400">
              Per active participant
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Top Earner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${leaderboard.length > 0 ? Math.max(...leaderboard.map(entry => entry.totalEarnings)).toLocaleString() : 0}
            </div>
            <p className="text-xs text-slate-400">
              Highest individual earnings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}