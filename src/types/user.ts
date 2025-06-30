
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  lastLogin?: Date;
  isActive: boolean;
}