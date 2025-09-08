"use client"

import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://brixs-backend.up.railway.app'

interface AchievementLevel {
  id: string;
  name: string;
  threshold: number;
  rewardDescription: string;
  rewardAmount: number;
  createdAt: string;
  updatedAt: string;
}

export function AchievementsTab({ formatDate, formatCurrency }: {
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
}) {
  const [achievementLevels, setAchievementLevels] = useState<AchievementLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState({ name: '', threshold: 0, rewardDescription: '', rewardAmount: 0 });
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AchievementLevel>>({});

  useEffect(() => {
    fetchAchievementLevels();
  }, []);

  const fetchAchievementLevels = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Admin token not found.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch achievement levels.');
      }
      const data = await response.json();
      setAchievementLevels(data.data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Admin token not found.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLevel)
      });
      if (!response.ok) {
        throw new Error('Failed to create achievement level.');
      }
      setNewLevel({ name: '', threshold: 0, rewardDescription: '', rewardAmount: 0 });
      fetchAchievementLevels();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    }
  };

  const handleEditLevel = (level: AchievementLevel) => {
    setEditingLevelId(level.id);
    setEditForm({
      name: level.name,
      threshold: level.threshold,
      rewardDescription: level.rewardDescription,
      rewardAmount: level.rewardAmount
    });
  };

  const handleUpdateLevel = async (id: string) => {
    setError(null);
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Admin token not found.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/achievements/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) {
        throw new Error('Failed to update achievement level.');
      }
      setEditingLevelId(null);
      setEditForm({});
      fetchAchievementLevels();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    }
  };

  const handleDeleteLevel = async (id: string) => {
    setError(null);
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Admin token not found.');
      return;
    }

    if (!confirm('Are you sure you want to delete this achievement level?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/achievements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete achievement level.');
      }
      fetchAchievementLevels();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-slate-400">Loading achievement levels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
        <p>{error}</p>
        <button onClick={fetchAchievementLevels} className="mt-2 text-sm text-red-300 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Achievement Management</h2>
        <p className="text-slate-400">Define and manage user achievement levels and rewards.</p>
      </div>

      {/* Create New Achievement Level */}
      <div className="bg-admin-card rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Create New Level</h3>
        <form onSubmit={handleCreateLevel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input
              type="text"
              value={newLevel.name}
              onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 text-sm"
              placeholder="e.g., Mercury, Jupiter, Saturn"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Threshold (Total Invested)</label>
            <input
              type="number"
              value={newLevel.threshold}
              onChange={(e) => setNewLevel({ ...newLevel, threshold: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 text-sm"
              placeholder="e.g., 2000"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Reward Description</label>
            <input
              type="text"
              value={newLevel.rewardDescription}
              onChange={(e) => setNewLevel({ ...newLevel, rewardDescription: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 text-sm"
              placeholder="e.g., 5% bonus on next investment"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Reward Amount</label>
            <input
              type="number"
              value={newLevel.rewardAmount}
              onChange={(e) => setNewLevel({ ...newLevel, rewardAmount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 text-sm"
              placeholder="e.g., 50 (for 50 USD or 5% if percentage based)"
              required
              min="0"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Create Level
          </button>
        </form>
      </div>

      {/* Existing Achievement Levels */}
      <div className="bg-admin-card rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Existing Levels ({achievementLevels.length})</h3>
        <div className="space-y-4">
          {achievementLevels.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No achievement levels defined yet.</p>
          ) : (
            achievementLevels.map((level) => (
              <div key={level.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                {editingLevelId === level.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateLevel(level.id); }} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Threshold</label>
                      <input
                        type="number"
                        value={editForm.threshold || 0}
                        onChange={(e) => setEditForm({ ...editForm, threshold: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 text-sm"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Reward Description</label>
                      <input
                        type="text"
                        value={editForm.rewardDescription || ''}
                        onChange={(e) => setEditForm({ ...editForm, rewardDescription: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Reward Amount</label>
                      <input
                        type="number"
                        value={editForm.rewardAmount || 0}
                        onChange={(e) => setEditForm({ ...editForm, rewardAmount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 text-sm"
                        required
                        min="0"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingLevelId(null)}
                        className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-white">{level.name}</div>
                      <div className="text-sm text-slate-400">
                        Threshold: {formatCurrency(level.threshold)}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 mb-2">
                      Reward: {level.rewardDescription} ({formatCurrency(level.rewardAmount)})
                    </div>
                    <div className="text-xs text-slate-500 mb-3">
                      Created: {formatDate(level.createdAt)} | Last Updated: {formatDate(level.updatedAt)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditLevel(level)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLevel(level.id)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}