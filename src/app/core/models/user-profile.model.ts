export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePicture?: string | null;
  firstName: string;
  lastName: string;
  roles: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  bio?: string | null;
  interests?: string[] | null;
  interestsCount?: number;
  
  followingCount: number;
  followersCount: number;
  postsCount: number;

  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;

  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isTwoFactorEnabled: boolean;
  isTwoFactorVerified: boolean;
  isTwoFactorBackupCodesGenerated: boolean;
  isTwoFactorBackupCodesUsed: boolean;
  hasInterests: boolean;
}
