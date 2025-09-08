'use client';

import { useState, useEffect } from 'react';
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
  Hash
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface InrPaymentRequest {
  id: string;
  userId: string;
  amount: number;
  planType: string;
  paymentProofUrl: string;
  transactionId: string;
  remarks?: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected';
  txHash?: string;
  adminNotes?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    username?: string;
  };
}

export default function InrPaymentsPage() {
  const { getToken } = useAuth();
  const [requests, setRequests] = useState<InrPaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<InrPaymentRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/inr-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setRequests(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMessage({ type: 'error', text: 'Failed to load payment requests' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !txHash.trim()) {
      setMessage({ type: 'error', text: 'Transaction hash is required' });
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/inr-request/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          txHash: txHash.trim(),
          adminNotes: adminNotes.trim()
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        throw new Error('Authentication expired');
      }

      if (response.ok) {
        setMessage({ type: 'success', text: 'Payment request approved and plan created successfully!' });
        setSelectedRequest(null);
        setTxHash('');
        setAdminNotes('');
        await fetchRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve request');
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to approve request' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/inr-request/${selectedRequest.id}/reject`, {
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
        setMessage({ type: 'success', text: 'Payment request rejected successfully' });
        setSelectedRequest(null);
        setAdminNotes('');
        await fetchRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject request');
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to reject request' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">INR Payment Requests</h1>
        <p className="text-slate-400 mt-1">Review and approve user payment requests</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">No payment requests found</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {request.planType}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {request.user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(request.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatAmount(request.amount)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    
                    {request.paymentProofUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://brixs-backend.up.railway.app'}${request.paymentProofUrl}`, '_blank')}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Proof
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Transaction ID</p>
                    <p className="text-white font-mono">{request.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Payment Method</p>
                    <p className="text-white capitalize">{request.paymentMethod}</p>
                  </div>
                  {request.txHash && (
                    <div>
                      <p className="text-slate-400">Blockchain TxHash</p>
                      <p className="text-white font-mono text-xs">{request.txHash.slice(0, 10)}...</p>
                    </div>
                  )}
                  {request.adminNotes && (
                    <div>
                      <p className="text-slate-400">Admin Notes</p>
                      <p className="text-white">{request.adminNotes}</p>
                    </div>
                  )}
                </div>

                {request.remarks && (
                  <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-slate-400 text-sm">User Remarks:</p>
                    <p className="text-white">{request.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Payment Request Details</h2>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedRequest(null);
                    setTxHash('');
                    setAdminNotes('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">User Email</p>
                    <p className="text-white">{selectedRequest.user.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Amount</p>
                    <p className="text-white font-semibold">{formatAmount(selectedRequest.amount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Plan Type</p>
                    <p className="text-white">{selectedRequest.planType}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>

                {selectedRequest.paymentProofUrl && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Payment Proof</p>
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://brixs-backend.up.railway.app'}${selectedRequest.paymentProofUrl}`}
                      alt="Payment Proof"
                      className="max-w-full h-auto rounded-lg border border-slate-600"
                    />
                  </div>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white font-medium block mb-2">
                      Transaction Hash * (Required for approval)
                    </label>
                    <Input
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="0x..."
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white font-medium block mb-2">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Optional notes about this decision"
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing || !txHash.trim()}
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
                          Approve & Create Plan
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleReject}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}