'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ExternalLink,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  Hash,
  RefreshCw
} from 'lucide-react';

interface LiquidityCancellationRequest {
  id: string;
  userId: string;
  amount: number;
  apy: number;
  lockInDays: number;
  createdAt: string;
  status: 'cancel_requested' | 'cancelled' | 'active';
  user: {
    id: string;
    email: string;
    username?: string;
  };
}

export default function LiquidityCancellationsPage() {
  console.log('Admin: LiquidityCancellationsPage component rendered');

  const { getToken } = useAuth();
  const [requests, setRequests] = useState<LiquidityCancellationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LiquidityCancellationRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refundTxHash, setRefundTxHash] = useState('');
  const [usdtProfitTxHash, setUsdtProfitTxHash] = useState('');
  const [brixProfitTxHash, setBrixProfitTxHash] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('Admin: Fetching cancellation requests...');
      const token = localStorage.getItem('admin_token');
      console.log('Admin: Retrieved token from localStorage:', token);
      console.log('Admin: Token type:', typeof token);
      console.log('Admin: Token length:', token?.length);

      if (!token) {
        console.log('Admin: No token found, redirecting to login');
        window.location.href = '/admin/login';
        return;
      }

      // Check if token is a valid JWT (should have 3 parts separated by dots)
      const tokenParts = token.split('.');
      console.log('Admin: Token parts:', tokenParts.length);
      if (tokenParts.length !== 3) {
        console.log('Admin: Token is not a valid JWT format, redirecting to login');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }

      // Fetch liquidity plans with cancel_requested status
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/liquidity/plans/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Admin: API response status:', response.status);

      if (response.status === 401) {
        console.log('Admin: Token expired, redirecting to login');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Admin: API response data:', result);

        // Filter for plans with cancel_requested status
        const cancellationRequests = (result.data || []).filter((plan: any) => plan.status === 'cancel_requested');
        console.log('Admin: Filtered cancellation requests:', cancellationRequests.length, cancellationRequests);

        setRequests(cancellationRequests);
      } else {
        console.error('Admin: API request failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Admin: Error response:', errorText);
      }
    } catch (error) {
      console.error('Admin: Error fetching requests:', error);
      setMessage({ type: 'error', text: 'Failed to load cancellation requests' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    console.log('Admin: Approve button clicked');
    console.log('Admin: selectedRequest:', selectedRequest);
    console.log('Admin: refundTxHash:', refundTxHash);
    console.log('Admin: usdtProfitTxHash:', usdtProfitTxHash);
    console.log('Admin: brixProfitTxHash:', brixProfitTxHash);

    if (!selectedRequest) {
      console.log('Admin: No selected request');
      return;
    }

    // Validate all required transaction hashes
    if (!refundTxHash.trim()) {
      console.log('Admin: Refund transaction hash is required');
      setMessage({ type: 'error', text: 'Refund transaction hash is required' });
      return;
    }
    if (!usdtProfitTxHash.trim()) {
      console.log('Admin: USDT profit transaction hash is required');
      setMessage({ type: 'error', text: 'USDT profit transaction hash is required' });
      return;
    }
    if (!brixProfitTxHash.trim()) {
      console.log('Admin: BRIX profit transaction hash is required');
      setMessage({ type: 'error', text: 'BRIX profit transaction hash is required' });
      return;
    }

    console.log('Admin: All validations passed, starting approval process');
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('admin_token');
      console.log('Admin: Retrieved admin token for approve:', token ? 'Token exists' : 'No token');
      console.log('Admin: Token type:', typeof token);
      console.log('Admin: Token length:', token?.length);
      console.log('Admin: API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Admin: Full endpoint:', `${process.env.NEXT_PUBLIC_API_URL}/api/liquidity/plans/${selectedRequest.id}/approve-cancel`);

      if (!token) {
        console.log('Admin: No admin token found');
        throw new Error('Not authenticated');
      }

      // Check if token is a valid JWT (should have 3 parts separated by dots)
      const tokenParts = token.split('.');
      console.log('Admin: Token parts for approve:', tokenParts.length);
      if (tokenParts.length !== 3) {
        console.log('Admin: Token is not a valid JWT format, clearing and redirecting to login');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        throw new Error('Invalid token format. Please login again.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/liquidity/plans/${selectedRequest.id}/approve-cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          refundTxHash: refundTxHash.trim(),
          usdtProfitTxHash: usdtProfitTxHash.trim(),
          brixProfitTxHash: brixProfitTxHash.trim(),
          adminNotes: adminNotes.trim()
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        throw new Error('Authentication expired');
      }

      if (response.ok) {
        const result = await response.json();
        setMessage({
          type: 'success',
          text: `Cancellation approved! Refund: $${result.data.cancellationDetails.refundAmount.toFixed(2)}, USDT Profit: $${result.data.cancellationDetails.usdtProfit.toFixed(2)}, BRIX Profit: ${result.data.cancellationDetails.brixProfit.toFixed(2)} BRIX`
        });
        setSelectedRequest(null);
        setRefundTxHash('');
        setUsdtProfitTxHash('');
        setBrixProfitTxHash('');
        setAdminNotes('');
        await fetchRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve cancellation');
      }
    } catch (error: any) {
      console.error('Error approving cancellation:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to approve cancellation' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    console.log('Admin: Reject button clicked');
    console.log('Admin: selectedRequest:', selectedRequest);

    if (!selectedRequest) {
      console.log('Admin: No selected request');
      return;
    }

    console.log('Admin: Starting rejection process');
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('admin_token');
      console.log('Admin: Retrieved admin token for reject:', token ? 'Token exists' : 'No token');
      console.log('Admin: Token type:', typeof token);
      console.log('Admin: Token length:', token?.length);
      console.log('Admin: API URL for reject:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Admin: Full reject endpoint:', `${process.env.NEXT_PUBLIC_API_URL}/api/liquidity/plans/${selectedRequest.id}/reject-cancel`);

      if (!token) {
        console.log('Admin: No admin token found for reject');
        throw new Error('Not authenticated');
      }

      // Check if token is a valid JWT (should have 3 parts separated by dots)
      const tokenParts = token.split('.');
      console.log('Admin: Token parts for reject:', tokenParts.length);
      if (tokenParts.length !== 3) {
        console.log('Admin: Token is not a valid JWT format for reject, clearing and redirecting to login');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        throw new Error('Invalid token format. Please login again.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/liquidity/plans/${selectedRequest.id}/reject-cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adminNotes: adminNotes.trim()
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        throw new Error('Authentication expired');
      }

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cancellation request rejected successfully' });
        setSelectedRequest(null);
        setAdminNotes('');
        await fetchRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject cancellation');
      }
    } catch (error: any) {
      console.error('Error rejecting cancellation:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to reject cancellation' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cancel_requested':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Cancellation Requested</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400">Cancelled</Badge>;
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">{status}</Badge>;
    }
  };

  // Calculate cancellation details for display
  const calculateCancellationDetails = (plan: LiquidityCancellationRequest) => {
    const cancellationFee = plan.amount * 0.2; // 20% fee
    const refundAmount = plan.amount * 0.8; // 80% refund

    // Calculate accrued profit (simplified calculation)
    const daysElapsed = Math.min(
      Math.floor((Date.now() - new Date(plan.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      plan.lockInDays
    );
    const totalMonths = Math.ceil(plan.lockInDays / 30);
    const totalProfit = plan.amount * (plan.apy / 100) * totalMonths;
    const dailyProfit = totalProfit / plan.lockInDays;
    const accruedProfit = dailyProfit * daysElapsed;

    const usdtProfit = accruedProfit * 0.5;
    const brixProfit = accruedProfit * 0.5;

    return {
      cancellationFee,
      refundAmount,
      totalProfit: accruedProfit,
      usdtProfit,
      brixProfit
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Liquidity Cancellation Requests</h1>
        <p className="text-slate-400 mt-1">Manage user liquidity plan cancellation requests</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-white">Cancellation Requests</span>
                <Button
                  onClick={fetchRequests}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No cancellation requests found.</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedRequest?.id === request.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-white">
                          {request.user?.username || request.user?.email || `User ${request.userId}`}
                        </div>
                        <div className="text-sm text-slate-400">
                          {formatCurrency(request.amount)} • {request.apy}% APY
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Requested on {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request Details */}
        {selectedRequest && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Cancellation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">User Email</p>
                  <p className="text-white">{selectedRequest.user.email}</p>
                </div>
                <div>
                  <p className="text-slate-400">Amount</p>
                  <p className="text-white font-semibold">{formatCurrency(selectedRequest.amount)}</p>
                </div>
                <div>
                  <p className="text-slate-400">APY</p>
                  <p className="text-white">{selectedRequest.apy}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              {/* Cancellation Calculation Details */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Cancellation Calculation</h4>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const details = calculateCancellationDetails(selectedRequest);
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Original Amount:</span>
                          <span className="text-white">{formatCurrency(selectedRequest.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cancellation Fee (20%):</span>
                          <span className="text-red-400">-{formatCurrency(details.cancellationFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Refund Amount (80%):</span>
                          <span className="text-green-400">{formatCurrency(details.refundAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Accrued Profit:</span>
                          <span className="text-cyan-400">{formatCurrency(details.totalProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">USDT Profit (50%):</span>
                          <span className="text-blue-400">{formatCurrency(details.usdtProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">BRIX Profit (50%):</span>
                          <span className="text-purple-400">{details.brixProfit.toFixed(2)} BRIX</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {selectedRequest.status === 'cancel_requested' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white font-medium block mb-2">
                      Refund Transaction Hash * (80% of principal)
                    </label>
                    <Input
                      value={refundTxHash}
                      onChange={(e) => setRefundTxHash(e.target.value)}
                      placeholder="0x..."
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white font-medium block mb-2">
                      USDT Profit Transaction Hash * (50% of profit)
                    </label>
                    <Input
                      value={usdtProfitTxHash}
                      onChange={(e) => setUsdtProfitTxHash(e.target.value)}
                      placeholder="0x..."
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white font-medium block mb-2">
                      BRIX Profit Transaction Hash * (50% of profit)
                    </label>
                    <Input
                      value={brixProfitTxHash}
                      onChange={(e) => setBrixProfitTxHash(e.target.value)}
                      placeholder="0x..."
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white font-medium block mb-2">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Optional notes about this cancellation"
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        console.log('Admin: Approve button clicked directly');
                        handleApprove();
                      }}
                      disabled={isProcessing || !refundTxHash.trim() || !usdtProfitTxHash.trim() || !brixProfitTxHash.trim()}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isProcessing ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve & Process Payments
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => {
                        console.log('Admin: Reject button clicked directly');
                        handleReject();
                      }}
                      disabled={isProcessing}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      {isProcessing ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Request
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}