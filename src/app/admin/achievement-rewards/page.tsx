'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Using regular textarea instead of custom component
import { Trophy, CheckCircle, XCircle, Clock, Upload, Eye } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://brixs-backend.up.railway.app';

interface AchievementRewardRequest {
  id: string;
  userId: string;
  achievementId: string;
  userAchievementId: string;
  rewardAmount: number;
  rewardToken: string;
  status: 'pending' | 'approved' | 'rejected';
  rewardImageUrl?: string;
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
  achievement: {
    id: string;
    name: string;
    type: string;
    rewardAmount: number;
    rewardToken: string;
  };
}

export default function AchievementRewardsPage() {
  const [requests, setRequests] = useState<AchievementRewardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AchievementRewardRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rewardImage, setRewardImage] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      console.log('🔑 [Admin Panel] Token from localStorage:', token ? `${token.substring(0, 50)}...` : 'null');

      const response = await fetch(`${API_BASE_URL}/api/admin/achievement-rewards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🔄 [Admin Panel] Fetch response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ [Admin Panel] Fetch error response:', errorText);
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      console.log('✅ [Admin Panel] Fetch successful, requests count:', data.data?.length || 0);
      setRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load achievement reward requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async () => {
    if (!selectedRequest || !rewardImage) {
      toast.error('Please select a reward image');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('admin_token');
      console.log('🔑 [Admin Panel] Approval token:', token ? `${token.substring(0, 50)}...` : 'null');
      console.log('📝 [Admin Panel] Approving request:', selectedRequest.id);
      console.log('🖼️ [Admin Panel] Image file:', rewardImage.name, 'Size:', rewardImage.size);

      const formData = new FormData();
      formData.append('rewardImage', rewardImage);
      formData.append('adminNotes', adminNotes);

      const response = await fetch(`${API_BASE_URL}/api/admin/achievement-rewards/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('🔄 [Admin Panel] Approval response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ [Admin Panel] Approval error response:', errorText);
        throw new Error('Failed to approve request');
      }

      const responseData = await response.json();
      console.log('✅ [Admin Panel] Approval successful:', responseData);

      toast.success('Achievement reward approved successfully!');
      setShowApproveDialog(false);
      setSelectedRequest(null);
      setAdminNotes('');
      setRewardImage(null);
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve achievement reward');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/achievement-rewards/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes })
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      toast.success('Achievement reward request rejected');
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject achievement reward request');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievement Reward Requests</h1>
          <p className="text-muted-foreground">
            Manage user achievement reward requests
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {requests.filter(r => r.status === 'pending').length} pending requests
        </div>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No reward requests yet</h3>
              <p className="text-sm text-muted-foreground text-center">
                Achievement reward requests will appear here when users request their rewards.
              </p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-amber-400" />
                    <div>
                      <CardTitle className="text-lg">{request.achievement.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {request.user.email} • {request.rewardAmount} {request.rewardToken}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApproveDialog(true);
                          }}
                          className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectDialog(true);
                          }}
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {request.rewardImageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`${API_BASE_URL}${request.rewardImageUrl}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Image
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Achievement Reward</DialogTitle>
            <DialogDescription>
              Upload a reward image and approve the achievement reward request for {selectedRequest?.user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reward Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setRewardImage(e.target.files?.[0] || null)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                placeholder="Optional notes about this approval..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing || !rewardImage}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? 'Processing...' : 'Approve & Send Reward'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Achievement Reward Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting the achievement reward request for {selectedRequest?.user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
              <textarea
                value={adminNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                required
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing || !adminNotes.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {processing ? 'Processing...' : 'Reject Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}