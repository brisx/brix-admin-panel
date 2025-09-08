'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  token: string;
  status: string;
  txHash: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  completedAt: string | null;
  reason: string | null;
  createdAt: string;
  user: {
    username: string | null;
    email: string;
    walletAddress?: string | null;
    brixsWalletAddress?: string | null;
  };
}

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
  liquidityPlans: any[];
  minerInvestments: any[];
  transactions: any[];
  withdrawals: any[];
  referrals: any[];
  statistics?: {
    totalLiquidityInvested: number;
    totalMinerInvested: number;
    totalInvested: number;
    totalReferralEarnings: number;
    activePlans: number;
    activeInvestments: number;
    totalReferrals: number;
  };
}

export default function WithdrawalPage() {
  const { getToken } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, [filter]);

  const loadWithdrawals = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals?status=${filter}`, {
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
        setWithdrawals(data.data || []);
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: string, txHash?: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, txHash }),
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        console.error('Token expired, please login again');
        return;
      }

      if (response.ok) {
        loadWithdrawals(); // Reload the list
      }
    } catch (error) {
      console.error('Error updating withdrawal:', error);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setIsLoadingUserDetails(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-details/${userId}`, {
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
        setSelectedUserDetails(data.data);
        setShowUserDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setIsLoadingUserDetails(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (filter === 'all') return true;
    return withdrawal.status.toLowerCase() === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Withdrawal Requests</h1>
        <p className="text-slate-400 mt-1">Manage user withdrawal requests</p>
      </div>

      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">All Withdrawals</h2>
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={loadWithdrawals}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWithdrawals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No withdrawal requests found.</p>
              </div>
            ) : (
              filteredWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-white">
                        {withdrawal.user?.username || withdrawal.user?.email || `User ${withdrawal.userId}`}
                      </div>
                      <div className="text-sm text-slate-400">
                        Requested on {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {withdrawal.amount} {withdrawal.token}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    {/* Wallet Addresses */}
                    <div className="text-sm text-slate-300 mb-2">
                      <span className="font-medium">USDT Address:</span>
                      <div className="font-mono bg-slate-700 p-2 rounded mt-1 break-all">
                        {withdrawal.user?.walletAddress || 'No USDT wallet connected - User needs to connect MetaMask'}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 mb-2">
                      <span className="font-medium">BRIXS Address:</span>
                      <div className="font-mono bg-slate-700 p-2 rounded mt-1 break-all">
                        {withdrawal.user?.brixsWalletAddress || 'No BRIXS wallet connected - User needs to connect BRIXS wallet'}
                      </div>
                    </div>

                    {withdrawal.txHash && (
                      <div className="text-sm text-slate-300">
                        <span className="font-medium">Tx Hash:</span> {withdrawal.txHash}
                      </div>
                    )}
                    {withdrawal.reason && (
                      <div className="text-sm text-slate-400 mt-1">
                        <span className="font-medium">Details:</span> {withdrawal.reason}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchUserDetails(withdrawal.userId)}
                      disabled={isLoadingUserDetails}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoadingUserDetails ? 'Loading...' : 'View User Details'}
                    </button>

                    {withdrawal.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected')}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>

                  {withdrawal.status === 'approved' && (
                    <div className="space-y-3" data-withdrawal-id={withdrawal.id}>
                      {/* Withdrawal Breakdown Display */}
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                        <h4 className="text-sm font-semibold text-white mb-3">Transfer Breakdown</h4>

                        {(() => {
                          // Parse withdrawal details from reason
                          const reason = withdrawal.reason || '';
                          const principalMatch = reason.match(/Principal:\s*\$([0-9.]+)/);
                          const profitMatch = reason.match(/Profit:\s*\$([0-9.]+)/);

                          const principal = principalMatch ? parseFloat(principalMatch[1]) : 0;
                          const profit = profitMatch ? parseFloat(profitMatch[1]) : 0;
                          const usdtProfit = profit * 0.5;
                          const brixProfit = profit * 0.5;

                          return (
                            <div className="space-y-3">
                              {/* Principal Transfer */}
                              {principal > 0 && (
                                <div className="bg-slate-600/30 rounded p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-white">Principal Amount</span>
                                    <span className="text-lg font-bold text-green-400">${principal.toFixed(2)} USDT</span>
                                  </div>
                                  <div className="text-xs text-slate-300 mb-2">
                                    <span className="font-medium">To USDT Wallet:</span>
                                  </div>
                                  <div className="font-mono bg-slate-700 p-2 rounded text-xs break-all">
                                    {withdrawal.user?.walletAddress || 'No USDT wallet - Use View User Details to get address'}
                                  </div>
                                </div>
                              )}

                              {/* USDT Profit Transfer */}
                              {usdtProfit > 0 && (
                                <div className="bg-slate-600/30 rounded p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-white">USDT Profit (50%)</span>
                                    <span className="text-lg font-bold text-blue-400">${usdtProfit.toFixed(2)} USDT</span>
                                  </div>
                                  <div className="text-xs text-slate-300 mb-2">
                                    <span className="font-medium">To USDT Wallet:</span>
                                  </div>
                                  <div className="font-mono bg-slate-700 p-2 rounded text-xs break-all">
                                    {withdrawal.user?.walletAddress || 'No USDT wallet address'}
                                  </div>
                                </div>
                              )}

                              {/* BRIX Profit Transfer */}
                              {brixProfit > 0 && (
                                <div className="bg-slate-600/30 rounded p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-white">BRIX Profit (50%)</span>
                                    <span className="text-lg font-bold text-orange-400">{brixProfit.toFixed(2)} BRIX</span>
                                  </div>
                                  <div className="text-xs text-slate-300 mb-2">
                                    <span className="font-medium">To BRIXS Wallet:</span>
                                  </div>
                                  <div className="font-mono bg-slate-700 p-2 rounded text-xs break-all">
                                    {withdrawal.user?.brixsWalletAddress || 'No BRIXS wallet - Use View User Details to get address'}
                                  </div>
                                </div>
                              )}

                              {/* Summary */}
                              <div className="bg-slate-600/50 rounded p-3 border-t border-slate-500/50">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-white">Total Transfer</span>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-white">
                                      ${principal.toFixed(2)} USDT + ${profit.toFixed(2)} Profit
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      Split: ${usdtProfit.toFixed(2)} USDT + {brixProfit.toFixed(2)} BRIX
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Transaction Hash Inputs */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Transaction Hashes</h4>

                        {(() => {
                          const reason = withdrawal.reason || '';
                          const principalMatch = reason.match(/Principal:\s*\$([0-9.]+)/);
                          const profitMatch = reason.match(/Profit:\s*\$([0-9.]+)/);

                          const principal = principalMatch ? parseFloat(principalMatch[1]) : 0;
                          const profit = profitMatch ? parseFloat(profitMatch[1]) : 0;
                          const usdtProfit = profit * 0.5;
                          const brixProfit = profit * 0.5;

                          return (
                            <div className="space-y-3">
                              {/* Principal Transaction Hash */}
                              {principal > 0 && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Principal Transaction Hash (${principal.toFixed(2)} USDT)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter principal transaction hash"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm"
                                    data-field="principalTxHash"
                                  />
                                </div>
                              )}

                              {/* USDT Profit Transaction Hash */}
                              {usdtProfit > 0 && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-1">
                                    USDT Profit Transaction Hash (${usdtProfit.toFixed(2)} USDT)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter USDT profit transaction hash"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm"
                                    data-field="usdtProfitTxHash"
                                  />
                                </div>
                              )}

                              {/* BRIX Profit Transaction Hash */}
                              {brixProfit > 0 && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-1">
                                    BRIX Profit Transaction Hash ({brixProfit.toFixed(2)} BRIX)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter BRIX profit transaction hash"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm"
                                    data-field="brixProfitTxHash"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <button
                          onClick={() => {
                            // Collect all transaction hashes
                            const container = document.querySelector(`[data-withdrawal-id="${withdrawal.id}"]`) as HTMLElement;
                            if (!container) return;

                            const principalInput = container.querySelector('input[data-field="principalTxHash"]') as HTMLInputElement;
                            const usdtProfitInput = container.querySelector('input[data-field="usdtProfitTxHash"]') as HTMLInputElement;
                            const brixProfitInput = container.querySelector('input[data-field="brixProfitTxHash"]') as HTMLInputElement;

                            const txHashes = {
                              principalTxHash: principalInput?.value || '',
                              usdtProfitTxHash: usdtProfitInput?.value || '',
                              brixProfitTxHash: brixProfitInput?.value || ''
                            };

                            // Check if required hashes are provided
                            const reason = withdrawal.reason || '';
                            const principalMatch = reason.match(/Principal:\s*\$([0-9.]+)/);
                            const profitMatch = reason.match(/Profit:\s*\$([0-9.]+)/);

                            const principal = principalMatch ? parseFloat(principalMatch[1]) : 0;
                            const profit = profitMatch ? parseFloat(profitMatch[1]) : 0;

                            // Admin can now get wallet addresses from "View User Details" modal
                            // No need to validate wallet connection since admin can process manually

                            let hasRequiredHashes = true;
                            if (principal > 0 && !txHashes.principalTxHash.trim()) hasRequiredHashes = false;
                            if (profit > 0 && !txHashes.usdtProfitTxHash.trim()) hasRequiredHashes = false;
                            if (profit > 0 && !txHashes.brixProfitTxHash.trim()) hasRequiredHashes = false;

                            if (!hasRequiredHashes) {
                              alert('Please enter all required transaction hashes');
                              return;
                            }

                            updateWithdrawalStatus(withdrawal.id, 'completed', JSON.stringify(txHashes));
                          }}
                          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          Mark as Completed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUserDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                <button
                  onClick={() => setShowUserDetailsModal(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">User ID</label>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm">{selectedUserDetails.id}</span>
                        <button
                          onClick={() => copyToClipboard(selectedUserDetails.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Email</label>
                      <div className="text-white">{selectedUserDetails.email}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Username</label>
                      <div className="text-white">{selectedUserDetails.username || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Referral Code</label>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono">{selectedUserDetails.referralCode}</span>
                        <button
                          onClick={() => copyToClipboard(selectedUserDetails.referralCode)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Member Since</label>
                      <div className="text-white">{new Date(selectedUserDetails.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Wallet Addresses */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Wallet Addresses</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400">USDT Wallet Address</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-800 p-3 rounded font-mono text-sm break-all text-white">
                          {selectedUserDetails.walletAddress || 'Not connected'}
                        </div>
                        {selectedUserDetails.walletAddress && (
                          <button
                            onClick={() => copyToClipboard(selectedUserDetails.walletAddress!)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">BRIXS Wallet Address</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-800 p-3 rounded font-mono text-sm break-all text-white">
                          {selectedUserDetails.brixsWalletAddress || 'Not connected'}
                        </div>
                        {selectedUserDetails.brixsWalletAddress && (
                          <button
                            onClick={() => copyToClipboard(selectedUserDetails.brixsWalletAddress!)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Financial Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{formatCurrency(selectedUserDetails.totalEarned)}</div>
                      <div className="text-sm text-slate-400">Total Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{formatCurrency(selectedUserDetails.totalInvested)}</div>
                      <div className="text-sm text-slate-400">Total Invested</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{formatCurrency(selectedUserDetails.totalWithdrawn)}</div>
                      <div className="text-sm text-slate-400">Total Withdrawn</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{formatCurrency(selectedUserDetails.totalReferralEarnings)}</div>
                      <div className="text-sm text-slate-400">Referral Earnings</div>
                    </div>
                  </div>
                </div>

                {/* Current Balances */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Current Balances</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{selectedUserDetails.usdtBalance.toFixed(2)}</div>
                      <div className="text-sm text-slate-400">USDT Balance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{selectedUserDetails.brixBalance.toFixed(2)}</div>
                      <div className="text-sm text-slate-400">BRIX Balance</div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                {selectedUserDetails.statistics && (
                  <div className="bg-slate-700/50 rounded-lg p-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">Investment Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{selectedUserDetails.statistics.activePlans}</div>
                        <div className="text-sm text-slate-400">Active Plans</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">{selectedUserDetails.statistics.activeInvestments}</div>
                        <div className="text-sm text-slate-400">Active Investments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">{selectedUserDetails.statistics.totalReferrals}</div>
                        <div className="text-sm text-slate-400">Total Referrals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-400">{formatCurrency(selectedUserDetails.statistics.totalLiquidityInvested)}</div>
                        <div className="text-sm text-slate-400">Liquidity Invested</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowUserDetailsModal(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Close
                </button>
                {selectedUserDetails.walletAddress && (
                  <button
                    onClick={() => {
                      copyToClipboard(selectedUserDetails.walletAddress!);
                      alert('USDT wallet address copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Copy USDT Address
                  </button>
                )}
                {selectedUserDetails.brixsWalletAddress && (
                  <button
                    onClick={() => {
                      copyToClipboard(selectedUserDetails.brixsWalletAddress!);
                      alert('BRIXS wallet address copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Copy BRIXS Address
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}