'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Save, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PaymentSettings {
  qrCodeImageUrl?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  accountHolderName?: string;
  upiId?: string;
  isInrPaymentEnabled: boolean;
}

export default function PaymentSettingsPage() {
  const { getToken } = useAuth();
  const [settings, setSettings] = useState<PaymentSettings>({
    qrCodeImageUrl: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    accountHolderName: '',
    upiId: '',
    isInrPaymentEnabled: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setSettings(result.data || {
          qrCodeImageUrl: '',
          bankAccountNumber: '',
          bankIfscCode: '',
          accountHolderName: '',
          upiId: '',
          isInrPaymentEnabled: false
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please upload an image file' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }
      setQrFile(file);
      setMessage(null);
    }
  };

  const uploadQrCode = async (): Promise<string | null> => {
    if (!qrFile) return null;

    const formData = new FormData();
    formData.append('qrCode', qrFile);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload-qr`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        throw new Error('Authentication expired');
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Upload response:', result);
        return result.data?.url || null;
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading QR code:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      let qrCodeImageUrl = settings.qrCodeImageUrl;
      
      // Upload new QR code if selected
      if (qrFile) {
        const uploadedUrl = await uploadQrCode();
        if (uploadedUrl) {
          qrCodeImageUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload QR code');
        }
      }

      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...settings,
          qrCodeImageUrl
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        throw new Error('Authentication expired');
      }

      if (response.ok) {
        const result = await response.json();
        setSettings(result.data);
        setQrFile(null);
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
        <h1 className="text-2xl font-bold text-white">Payment Settings</h1>
        <p className="text-slate-400 mt-1">Configure INR payment methods for users</p>
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

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Enable INR Payments</label>
              <p className="text-sm text-slate-400">Allow users to pay using INR</p>
            </div>
            <input
              type="checkbox"
              checked={settings.isInrPaymentEnabled}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, isInrPaymentEnabled: e.target.checked }))
              }
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">UPI Payment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="upiId" className="text-white font-medium block mb-2">UPI ID</label>
            <Input
              id="upiId"
              value={settings.upiId || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, upiId: e.target.value }))}
              placeholder="example@upi"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div>
            <label htmlFor="qrCode" className="text-white font-medium block mb-2">QR Code Image</label>
            <div className="mt-2">
              <input
                id="qrCode"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="qrCode"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-400">
                  {qrFile ? qrFile.name : settings.qrCodeImageUrl ? 'Change QR Code' : 'Upload QR Code'}
                </p>
              </label>
            </div>
            {settings.qrCodeImageUrl && !qrFile && (
              <div className="mt-2">
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://brixs-backend.up.railway.app'}${settings.qrCodeImageUrl}`}
                  alt="Current QR Code"
                  className="w-32 h-32 object-contain bg-white rounded-lg p-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowQrModal(true)}
                  onError={(e) => {
                    console.error('Failed to load QR code in admin panel:', settings.qrCodeImageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-xs text-slate-400 mt-1">Click to enlarge</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Bank Transfer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="accountHolderName" className="text-white font-medium block mb-2">Account Holder Name</label>
            <Input
              id="accountHolderName"
              value={settings.accountHolderName || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, accountHolderName: e.target.value }))}
              placeholder="John Doe"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div>
            <label htmlFor="bankAccountNumber" className="text-white font-medium block mb-2">Bank Account Number</label>
            <Input
              id="bankAccountNumber"
              value={settings.bankAccountNumber || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
              placeholder="1234567890"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div>
            <label htmlFor="bankIfscCode" className="text-white font-medium block mb-2">IFSC Code</label>
            <Input
              id="bankIfscCode"
              value={settings.bankIfscCode || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, bankIfscCode: e.target.value }))}
              placeholder="ABCD0123456"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              QR Code Preview
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Current QR code for UPI payments
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://brixs-backend.up.railway.app'}${settings.qrCodeImageUrl}`}
              alt="QR Code Preview"
              className="max-w-full max-h-96 object-contain bg-white rounded-lg"
              onError={(e) => {
                console.error('Failed to load QR code in modal:', settings.qrCodeImageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}