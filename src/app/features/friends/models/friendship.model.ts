// src/app/features/friends/models/friendship.model.ts
import { User } from '../../../shared/models/user.model'; // Adjust the path as needed
    
export enum FriendshipStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
  }
  
  export interface Friendship {
    id: number;
    status: FriendshipStatus;
    createdAt: Date;
    updatedAt: Date;
    friend: User; 
  }
  