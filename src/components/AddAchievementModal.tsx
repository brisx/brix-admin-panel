'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface AddAchievementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://brixs-backend.up.railway.app/';
const ADMIN_TOKEN =
  process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token-here';

export default function AddAchievementModal({
  open,
  onOpenChange,
  onSuccess,
}: AddAchievementModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    image: '',
    requiredPoints: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (
        !formData.type ||
        !formData.name ||
        !formData.description ||
        !formData.image
      ) {
        throw new Error('Please fill in all required fields');
      }

      const response = await fetch(`${API_BASE_URL}/api/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_TOKEN,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create achievement');
      }

      // Reset form
      setFormData({
        type: '',
        name: '',
        description: '',
        image: '',
        requiredPoints: 0,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error creating achievement:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 
          ring-offset-background transition-opacity hover:opacity-100 
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle>Add New Achievement</DialogTitle>
          <DialogDescription>
            Create a new achievement reward for users to claim
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Achievement Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              Achievement Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select achievement type</option>
              <option value="Mercury">Mercury</option>
              <option value="Jupiter">Jupiter</option>
              <option value="Saturn">Saturn</option>
            </select>
          </div>

          {/* Reward Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Reward Name *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Mercury Level Badge"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description *
            </label>
            <Input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the achievement reward"
              required
            />
          </div>

          {/* Required Points */}
          <div>
            <label
              htmlFor="requiredPoints"
              className="block text-sm font-medium mb-2"
            >
              Required Points
            </label>
            <Input
              id="requiredPoints"
              type="number"
              value={formData.requiredPoints}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  requiredPoints: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="Points needed to unlock"
              min="0"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-2">
              Achievement Reward Image *
            </label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              required
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Achievement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

