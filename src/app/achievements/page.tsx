'use client';

import { Trophy, Award, CheckCircle, XCircle, Clock, Plus, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
// import { Achievement } from '@/components/achievement';
import AddAchievementModal from '../../components/AddAchievementModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://brixs-backend.up.railway.app';
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token-here';

export default function AdminAchievementsPage() {

  interface Achievement {
    id: string;
    type: string;
    name: string;
    description: string;
    image: string;
    isActive: boolean;
    userCount?: number;
    createdAt: string;
    updatedAt: string;
  }


  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/achievements`, {
        headers: {
          'x-api-key': ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch achievements');
      }
      
      const data = await response.json();
      setAchievements(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleAddSuccess = () => {
    fetchAchievements(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">
            Manage and track user achievements
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          {/* <Plus className="mr-2 h-4 w-4" /> */}
          Add Achievement
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{achievement.name}</CardTitle>
                        <Badge variant={achievement.isActive ? 'default' : 'secondary'}>
                          {achievement.type}
                        </Badge>
                      </div>
                      <CardDescription>{achievement.description}</CardDescription>
                    </CardHeader>
                    {achievement.image && (
                      <div className="px-6">
                        <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                          <img
                            src={achievement.image}
                            alt={achievement.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    )}
                    <CardContent className="mt-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          {/* <Trophy className="mr-1 h-4 w-4" /> */}
                          <span>Type: {achievement.type}</span>
                        </div>
                        <div className="flex items-center">
                          {/* <Users className="mr-1 h-4 w-4" /> */}
                          <span>{achievement.userCount || 0} users</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Created: {new Date(achievement.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  {/* <Trophy className="mx-auto h-12 w-12 text-muted-foreground" /> */}
                  <h3 className="mt-2 text-sm font-medium text-foreground">No achievements yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by creating a new achievement.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddAchievementModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
