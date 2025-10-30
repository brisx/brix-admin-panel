'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Network, Search, Users, Target, DollarSign, Calendar } from 'lucide-react';

interface NetworkNode {
  id: string;
  username: string | null;
  email: string;
  level: number;
  totalEarned: number;
  referrals: NetworkNode[];
  isActive: boolean;
  joinedAt: string;
}

interface ReferralNetworkProps {
  maxLevels?: number;
}

export function ReferralNetwork({ maxLevels = 3 }: ReferralNetworkProps) {
  const [networkData, setNetworkData] = useState<NetworkNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<NetworkNode | null>(null);

  useEffect(() => {
    loadNetworkData();
  }, []);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        console.error('No admin token found');
        return;
      }

      const response = await fetch('https://brixs-backend.up.railway.app/api/admin/referral-network', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNetworkData(data.data || []);
      }
    } catch (error) {
      console.error('Error loading network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNetwork = networkData.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNodeColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-blue-500';
      case 1: return 'bg-green-500';
      case 2: return 'bg-purple-500';
      case 3: return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 0: return 'Root';
      case 1: return 'Level 1';
      case 2: return 'Level 2';
      case 3: return 'Level 3';
      default: return `Level ${level}`;
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
      {/* Search and Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Network className="h-5 w-5" />
            Referral Network Visualization
          </CardTitle>
          <CardDescription className="text-slate-400">
            Explore the referral network structure and relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button
              onClick={loadNetworkData}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Search className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Tree */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Network Structure</CardTitle>
              <CardDescription className="text-slate-400">
                Visual representation of referral relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredNetwork.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No users found</p>
                ) : (
                  filteredNetwork.map((user) => (
                    <div key={user.id} className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getNodeColor(user.level)}`}></div>
                          <div>
                            <div className="font-medium text-white">
                              {user.username || user.email}
                            </div>
                            <div className="text-sm text-slate-400">
                              {getLevelLabel(user.level)} • {user.referrals.length} referrals
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-400">
                            ${user.totalEarned.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-400">earned</div>
                        </div>
                      </div>

                      {/* Show direct referrals */}
                      {user.referrals.length > 0 && (
                        <div className="ml-6 space-y-2">
                          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                            Direct Referrals ({user.referrals.length})
                          </div>
                          {user.referrals.slice(0, 3).map((referral) => (
                            <div key={referral.id} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border-l-2 border-slate-500">
                              <div className={`w-2 h-2 rounded-full ${getNodeColor(referral.level)}`}></div>
                              <div className="flex-1">
                                <div className="text-sm text-white">
                                  {referral.username || referral.email}
                                </div>
                                <div className="text-xs text-slate-400">
                                  Level {referral.level} • ${referral.totalEarned} earned
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(referral)}
                                className="border-slate-600 text-slate-400 hover:bg-slate-700"
                              >
                                View
                              </Button>
                            </div>
                          ))}
                          {user.referrals.length > 3 && (
                            <div className="text-xs text-slate-500 ml-5">
                              +{user.referrals.length - 3} more referrals
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <div>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Details</CardTitle>
              <CardDescription className="text-slate-400">
                {selectedUser ? 'Selected user information' : 'Select a user to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getNodeColor(selectedUser.level)}`}></div>
                    <div>
                      <div className="font-medium text-white">
                        {selectedUser.username || selectedUser.email}
                      </div>
                      <div className="text-sm text-slate-400">
                        {getLevelLabel(selectedUser.level)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Total Earned</div>
                      <div className="font-medium text-green-400">
                        ${selectedUser.totalEarned.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Referrals</div>
                      <div className="font-medium text-white">
                        {selectedUser.referrals.length}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-sm mb-1">Member Since</div>
                    <div className="text-white">
                      {new Date(selectedUser.joinedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-sm mb-2">Status</div>
                    <Badge
                      variant={selectedUser.isActive ? 'default' : 'secondary'}
                      className={selectedUser.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                      }
                    >
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-400" />
                  <p className="text-slate-400">Select a user to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Network Statistics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Network Statistics</CardTitle>
          <CardDescription className="text-slate-400">
            Overall referral network metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {networkData.length}
              </div>
              <div className="text-sm text-slate-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {networkData.filter(u => u.level === 1).length}
              </div>
              <div className="text-sm text-slate-400">Level 1 Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {networkData.filter(u => u.level === 2).length}
              </div>
              <div className="text-sm text-slate-400">Level 2 Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {networkData.filter(u => u.level === 3).length}
              </div>
              <div className="text-sm text-slate-400">Level 3 Users</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}