'use client'; 

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Settings, Save, RefreshCw, DollarSign, Users, Target } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralSettingsData {
  directReferralPercentage: number;
  level1RewardPercentage: number;
  level2RewardPercentage: number;
  level3RewardPercentage: number;
  level1RequiredReferrals: number;
  level1RequiredAmount: number;
  level2RequiredReferrals: number;
  level3RequiredReferrals: number;
  maxReferralLevels: number;
  referralExpiryDays: number;
  autoApproveRewards: boolean;
}

interface ReferralSettingsProps {
  onSettingsUpdate: () => void;
}

export function ReferralSettings({ onSettingsUpdate }: ReferralSettingsProps) {
  const [settings, setSettings] = useState<ReferralSettingsData>({
    directReferralPercentage: 2.5,
    level1RewardPercentage: 10,
    level2RewardPercentage: 5,
    level3RewardPercentage: 2.5,
    level1RequiredReferrals: 5,
    level1RequiredAmount: 2500,
    level2RequiredReferrals: 25,
    level3RequiredReferrals: 125,
    maxReferralLevels: 3,
    referralExpiryDays: 30,
    autoApproveRewards: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch('https://brixs-backend.up.railway.app/api/admin/referral-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data || settings);
      }
    } catch (error) {
      console.error('Error loading referral settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch('https://brixs-backend.up.railway.app/api/admin/referral-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Referral settings updated successfully');
        onSettingsUpdate();
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving referral settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ReferralSettingsData, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
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
      {/* Reward Percentages */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5" />
            Reward Percentages
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure reward percentages for different referral types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="directReferral" className="text-slate-300">
                Direct Referral (%)
              </Label>
              <Input
                id="directReferral"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings.directReferralPercentage}
                onChange={(e) => handleInputChange('directReferralPercentage', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Percentage of referred user's investment given as USDT reward
              </p>
            </div>

            <div>
              <Label htmlFor="level1Reward" className="text-slate-300">
                Level 1 Completion (%)
              </Label>
              <Input
                id="level1Reward"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings.level1RewardPercentage}
                onChange={(e) => handleInputChange('level1RewardPercentage', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Percentage of total investment for Level 1 completion (BRIX)
              </p>
            </div>

            <div>
              <Label htmlFor="level2Reward" className="text-slate-300">
                Level 2 Completion (%)
              </Label>
              <Input
                id="level2Reward"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings.level2RewardPercentage}
                onChange={(e) => handleInputChange('level2RewardPercentage', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Percentage for Level 2 completion (BRIX)
              </p>
            </div>

            <div>
              <Label htmlFor="level3Reward" className="text-slate-300">
                Level 3 Completion (%)
              </Label>
              <Input
                id="level3Reward"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings.level3RewardPercentage}
                onChange={(e) => handleInputChange('level3RewardPercentage', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Percentage for Level 3 completion (BRIX)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Requirements */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5" />
            Level Requirements
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure requirements for completing each referral level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="level1Referrals" className="text-slate-300">
                Level 1 - Required Referrals
              </Label>
              <Input
                id="level1Referrals"
                type="number"
                min="1"
                value={settings.level1RequiredReferrals}
                onChange={(e) => handleInputChange('level1RequiredReferrals', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="level1Amount" className="text-slate-300">
                Level 1 - Required Amount ($)
              </Label>
              <Input
                id="level1Amount"
                type="number"
                min="0"
                value={settings.level1RequiredAmount}
                onChange={(e) => handleInputChange('level1RequiredAmount', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="level2Referrals" className="text-slate-300">
                Level 2 - Required Referrals
              </Label>
              <Input
                id="level2Referrals"
                type="number"
                min="1"
                value={settings.level2RequiredReferrals}
                onChange={(e) => handleInputChange('level2RequiredReferrals', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level3Referrals" className="text-slate-300">
                Level 3 - Required Referrals
              </Label>
              <Input
                id="level3Referrals"
                type="number"
                min="1"
                value={settings.level3RequiredReferrals}
                onChange={(e) => handleInputChange('level3RequiredReferrals', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="maxLevels" className="text-slate-300">
                Maximum Referral Levels
              </Label>
              <Input
                id="maxLevels"
                type="number"
                min="1"
                max="10"
                value={settings.maxReferralLevels}
                onChange={(e) => handleInputChange('maxReferralLevels', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure referral system behavior and automation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDays" className="text-slate-300">
                Referral Expiry (Days)
              </Label>
              <Input
                id="expiryDays"
                type="number"
                min="1"
                max="365"
                value={settings.referralExpiryDays}
                onChange={(e) => handleInputChange('referralExpiryDays', Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Days before inactive referrals expire
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoApprove"
                checked={settings.autoApproveRewards}
                onChange={(e) => handleInputChange('autoApproveRewards', e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
              />
              <div>
                <Label htmlFor="autoApprove" className="text-slate-300">
                  Auto-approve Rewards
                </Label>
                <p className="text-xs text-slate-400">
                  Automatically approve referral rewards (bypass admin approval)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Preview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Settings Preview</CardTitle>
          <CardDescription className="text-slate-400">
            Current configuration summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Reward Structure</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Direct Referral:</span>
                  <span className="text-green-400">{settings.directReferralPercentage}% (USDT)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Level 1 Completion:</span>
                  <span className="text-purple-400">{settings.level1RewardPercentage}% (BRIX)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Level 2 Completion:</span>
                  <span className="text-purple-400">{settings.level2RewardPercentage}% (BRIX)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Level 3 Completion:</span>
                  <span className="text-purple-400">{settings.level3RewardPercentage}% (BRIX)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-2">Level Requirements</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Level 1:</span>
                  <span className="text-blue-400">{settings.level1RequiredReferrals} refs OR ${settings.level1RequiredAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Level 2:</span>
                  <span className="text-blue-400">{settings.level2RequiredReferrals} total referrals</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Level 3:</span>
                  <span className="text-blue-400">{settings.level3RequiredReferrals} total referrals</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Auto-approve:</span>
                  <span className={settings.autoApproveRewards ? 'text-green-400' : 'text-red-400'}>
                    {settings.autoApproveRewards ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={loadSettings}
          variant="outline"
          className="border-slate-600 text-slate-400 hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>

        <Button
          onClick={saveSettings}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
