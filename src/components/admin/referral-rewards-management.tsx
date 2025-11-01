'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '../ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Loader2, CheckCircle, Clock, DollarSign, User, Calendar, AlertCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralReward {
  id: string;
  level?: number;
  rewardType: 'direct_referral' | 'level_completion';
  amount: number;
  currency: 'USDT' | 'BRIX';
  status: 'pending' | 'approved' | 'credited' | 'failed';
  adminTxnId?: string;
  creditedAt?: string;
  createdAt: string;
  receiver: {
    email: string;
    username?: string;
  };
  triggeringUser?: {
    email: string;
    username?: string;
  };
}

interface ReferralRewardsManagementProps {
  onStatsUpdate: () => void;
}

export function ReferralRewardsManagement({ onStatsUpdate }: ReferralRewardsManagementProps) {
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingReward, setApprovingReward] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<ReferralReward | null>(null);
  const [adminTxnId, setAdminTxnId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'credited'>('pending');

  useEffect(() => {
    fetchAllRewards();
  }, []);

  const fetchAllRewards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      // Fetch ALL rewards (not just pending) to show in different tabs
      const response = await fetch('https://brixs-backend.up.railway.app/api/admin/referral-rewards/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        toast.error('Authentication expired');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setRewards(data.data || []);
      } else {
        toast.error('Failed to load rewards');
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReward = async () => {
    if (!selectedReward || !adminTxnId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    setApprovingReward(selectedReward.id);

    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch('https://brixs-backend.up.railway.app/api/admin/referral-rewards/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId: selectedReward.id,
          adminTxnId: adminTxnId.trim()
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        toast.error('Authentication expired');
        return;
      }

      if (response.ok) {
        toast.success('Reward approved successfully');
        setDialogOpen(false);
        setAdminTxnId('');
        setSelectedReward(null);
        await fetchAllRewards();
        onStatsUpdate();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to approve reward');
      }
    } catch (error) {
      console.error('Error approving reward:', error);
      toast.error('Failed to approve reward');
    } finally {
      setApprovingReward(null);
    }
  };

  const openApprovalDialog = (reward: ReferralReward) => {
    setSelectedReward(reward);
    setAdminTxnId('');
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Approved</Badge>;
      case 'credited':
        return <Badge variant="default" className="bg-green-500">Credited</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRewardTypeLabel = (type: string, level?: number) => {
    if (type === 'level_completion') {
      return `Level ${level} Completion`;
    }
    return 'Direct Referral';
  };

  const filteredRewards = rewards.filter(reward => {
    if (filter === 'all') return true;
    return reward.status === filter;
  });

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5" />
            Referral Rewards Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-slate-400">Loading pending rewards...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5" />
            Referral Rewards Management
          </CardTitle>
          <CardDescription className="text-slate-400">
            Approve pending USDT referral rewards and manage reward payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {['all', 'pending', 'approved', 'credited'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status as any)}
                className={filter === status 
                  ? 'bg-cyan-600 hover:bg-cyan-700' 
                  : 'border-slate-600 text-slate-400 hover:bg-slate-700'
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {filteredRewards.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-400" />
              <p className="text-slate-400">No {filter === 'all' ? '' : filter + ' '}rewards found</p>
              <p className="text-sm text-slate-500">
                {filter === 'pending' ? 'All rewards have been processed' : 'No rewards match the selected filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-slate-700/30 border-slate-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {getRewardTypeLabel(reward.rewardType, reward.level)}
                      </div>
                      <div className="text-sm text-slate-400">
                        Recipient: {reward.receiver.username || reward.receiver.email}
                      </div>
                      {reward.triggeringUser && (
                        <div className="text-sm text-slate-400">
                          Triggered by: {reward.triggeringUser.username || reward.triggeringUser.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span className="text-xs text-slate-500">
                          {new Date(reward.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="font-semibold text-lg text-white">
                        {reward.amount.toFixed(2)} {reward.currency}
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(reward.status)}
                      </div>
                    </div>

                    {reward.status === 'pending' && reward.currency === 'USDT' && (
                      <Button
                        onClick={() => openApprovalDialog(reward)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Approve USDT Referral Reward</DialogTitle>
            <DialogDescription className="text-slate-400">
              Confirm the reward approval and provide the blockchain transaction ID.
            </DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-300">Recipient</Label>
                  <p className="text-sm text-slate-400">
                    {selectedReward.receiver.username || selectedReward.receiver.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-300">Amount</Label>
                  <p className="text-sm text-slate-400">
                    {selectedReward.amount.toFixed(2)} {selectedReward.currency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-300">Reward Type</Label>
                  <p className="text-sm text-slate-400">
                    {getRewardTypeLabel(selectedReward.rewardType, selectedReward.level)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-300">Created</Label>
                  <p className="text-sm text-slate-400">
                    {new Date(selectedReward.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="txnId" className="text-sm font-medium text-slate-300">
                  Blockchain Transaction ID
                </Label>
                <Input
                  id="txnId"
                  placeholder="Enter the transaction hash..."
                  value={adminTxnId}
                  onChange={(e) => setAdminTxnId(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400">
                  This will be shown to the user as proof of payment
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={approvingReward !== null}
              className="border-slate-600 text-slate-400 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveReward}
              disabled={approvingReward !== null || !adminTxnId.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {approvingReward ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Approving...
                </>
              ) : (
                'Approve Reward'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
