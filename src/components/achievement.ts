export interface Achievement {
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
