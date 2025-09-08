'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Save, Settings as SettingsIcon } from 'lucide-react';

interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  withdrawalEnabled: boolean;
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  referralBonusPercentage: number;
  supportEmail: string;
  systemMessage: string;
  totalCoinSold: number;
}

export default function SettingsPage() {
  const { getToken } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    registrationEnabled: true,
    withdrawalEnabled: true,
    minWithdrawalAmount: 10,
    maxWithdrawalAmount: 10000,
    referralBonusPercentage: 5,
    supportEmail: '',
    systemMessage: '',
    totalCoinSold: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`, {
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
        setSettings(data.data || settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setMessage({ type: 'error', text: 'Not authenticated' });
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalCoinSold: settings.totalCoinSold
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        setMessage({ type: 'error', text: 'Authentication expired' });
        return;
      }

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 mt-1">Configure system-wide settings and preferences</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            General Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Maintenance Mode</label>
                <p className="text-sm text-slate-400">Put the system in maintenance mode</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">User Registration</label>
                <p className="text-sm text-slate-400">Allow new user registrations</p>
              </div>
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) => handleInputChange('registrationEnabled', e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Withdrawals</label>
                <p className="text-sm text-slate-400">Allow user withdrawals</p>
              </div>
              <input
                type="checkbox"
                checked={settings.withdrawalEnabled}
                onChange={(e) => handleInputChange('withdrawalEnabled', e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Financial Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Minimum Withdrawal Amount ($)</label>
              <input
                type="number"
                value={settings.minWithdrawalAmount}
                onChange={(e) => handleInputChange('minWithdrawalAmount', Number(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                min="1"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Maximum Withdrawal Amount ($)</label>
              <input
                type="number"
                value={settings.maxWithdrawalAmount}
                onChange={(e) => handleInputChange('maxWithdrawalAmount', Number(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                min="1"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Referral Bonus Percentage (%)</label>
              <input
                type="number"
                value={settings.referralBonusPercentage}
                onChange={(e) => handleInputChange('referralBonusPercentage', Number(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Total Coin Sold</label>
              <input
                type="number"
                value={settings.totalCoinSold}
                onChange={(e) => handleInputChange('totalCoinSold', Number(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                min="0"
                placeholder="Enter total coins sold"
              />
              <p className="text-sm text-slate-400 mt-1">This value will be displayed to all users</p>
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Contact Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                placeholder="support@example.com"
              />
            </div>
          </div>
        </div>

        {/* System Message */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">System Message</h2>

          <div>
            <label className="block text-white font-medium mb-2">Broadcast Message</label>
            <textarea
              value={settings.systemMessage}
              onChange={(e) => handleInputChange('systemMessage', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
              rows={4}
              placeholder="Enter system-wide message..."
            />
            <p className="text-sm text-slate-400 mt-1">This message will be displayed to all users</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white rounded-md font-medium transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}