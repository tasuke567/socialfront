// src/app/features/friends/models/friend.model.ts

import { User } from '../../../shared/models/user.model'; // Ensure correct path

export interface Friend {
  id: string; // Assuming ID is a string. Change if needed.
  name: string;
  profilePicture: string;
  status: string;  // Friendship status, e.g., PENDING, ACCEPTED, etc.
  friend: User;    // Assuming `friend` is a `User` object
}
