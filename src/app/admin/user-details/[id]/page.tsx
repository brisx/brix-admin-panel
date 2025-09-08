'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Wallet, TrendingUp, DollarSign, Calendar, Activity, Users, Eye, Copy, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserDetails {
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
  statistics: {
    totalLiquidityInvested: number;
    totalMinerInvested: number;
    totalInvested: number;
    totalReferralEarnings: number;
    activePlans: number;
    activeInvestments: number;
    totalReferrals: number;
  };
  liquidityPlans: Array<{
    id: string;
    name: string;
    amount: number;
    apy: number;
    isActive: boolean;
    createdAt: string;
  }>;
  minerInvestments: Array<{
    id: string;
    minerType: string;
    amount: number;
    apy: number;
    status: string;
    maturityDate: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    token: string;
    status: string;
    createdAt: string;
  }>;
  withdrawals: Array<{
    id: string;
    amount: number;
    token: string;
    status: string;
    createdAt: string;
  }>;
  referrals: Array<{
    id: string;
    email: string;
    username: string | null;
    totalInvested: number;
    createdAt: string;
  }>;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      loadUserDetails();
    }
  }, [params?.id]);

  const loadUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        setError('Please login again');
        return;
      }

      console.log('🔍 Loading user details for ID:', params?.id);
      console.log('🌐 API URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-details/${params?.id}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-details/${params?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        setError('Session expired. Please login again.');
        return;
      }

      if (response.status === 404) {
        setError('User not found');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API error:', response.status, errorText);
        setError('Failed to load user details');
        return;
      }

      const data = await response.json();
      console.log('✅ User data received:', data);
      setUser(data.data);

    } catch (err: any) {
      console.error('❌ Error loading user details:', err);
      setError(err.message || 'Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading User</h2>
            <p className="text-slate-400">{error || 'User not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-slate-400">Detailed information for {user.username || user.email}</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(user.statistics.totalInvested)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(user.totalEarned)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Plans</CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{user.statistics.activePlans}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Referrals</CardTitle>
              <Users className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{user.statistics.totalReferrals}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600">Overview</TabsTrigger>
            <TabsTrigger value="wallets" className="data-[state=active]:bg-cyan-600">Wallets</TabsTrigger>
            <TabsTrigger value="investments" className="data-[state=active]:bg-cyan-600">Investments</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-cyan-600">Transactions</TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-cyan-600">Referrals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Username</label>
                    <p className="text-white">{user.username || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Email</label>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Role</label>
                    <Badge variant={user.isAdmin ? "default" : "secondary"}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Joined</label>
                    <p className="text-white">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Referral Code</label>
                    <p className="text-white font-mono">{user.referralCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Last Updated</label>
                    <p className="text-white">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    USDT Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded flex-1">
                        {user.walletAddress || 'Not set'}
                      </code>
                      {user.walletAddress && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(user.walletAddress!, 'usdt')}
                          className="border-slate-600"
                        >
                          {copiedAddress === 'usdt' ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Balance</label>
                    <p className="text-xl font-bold text-green-400">{formatCurrency(user.usdtBalance)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    BRIXS Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded flex-1">
                        {user.brixsWalletAddress || 'Not set'}
                      </code>
                      {user.brixsWalletAddress && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(user.brixsWalletAddress!, 'brixs')}
                          className="border-slate-600"
                        >
                          {copiedAddress === 'brixs' ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Balance</label>
                    <p className="text-xl font-bold text-blue-400">{user.brixBalance.toLocaleString()} BRIXS</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Liquidity Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.liquidityPlans.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No liquidity plans</p>
                  ) : (
                    <div className="space-y-3">
                      {user.liquidityPlans.map((plan) => (
                        <div key={plan.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <div>
                            <p className="font-medium text-white">{plan.name}</p>
                            <p className="text-sm text-slate-400">{formatCurrency(plan.amount)} • {plan.apy}% APY</p>
                          </div>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Miner Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.minerInvestments.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No miner investments</p>
                  ) : (
                    <div className="space-y-3">
                      {user.minerInvestments.map((investment) => (
                        <div key={investment.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <div>
                            <p className="font-medium text-white">{investment.minerType}</p>
                            <p className="text-sm text-slate-400">{formatCurrency(investment.amount)} • {investment.apy}% APY</p>
                          </div>
                          <Badge variant={investment.status === 'ACTIVE' ? "default" : "secondary"}>
                            {investment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {user.transactions.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No transactions found</p>
                ) : (
                  <div className="space-y-3">
                    {user.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{transaction.type}</p>
                          <p className="text-sm text-slate-400">{formatDate(transaction.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">{formatCurrency(transaction.amount)}</p>
                          <Badge variant={transaction.status === 'COMPLETED' ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Referral Network</CardTitle>
              </CardHeader>
              <CardContent>
                {user.referrals.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No referrals found</p>
                ) : (
                  <div className="space-y-3">
                    {user.referrals.map((referral) => (
                      <div key={referral.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{referral.username || 'No username'}</p>
                          <p className="text-sm text-slate-400">{referral.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">{formatCurrency(referral.totalInvested)}</p>
                          <p className="text-sm text-slate-400">{formatDate(referral.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}