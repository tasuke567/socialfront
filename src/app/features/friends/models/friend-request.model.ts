import { User } from '../../../shared/models/user.model';
import { FriendStatus } from './friend-status.enum';

export interface FriendRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: FriendStatus;
    sender?: User;      // The user who sent the request
    receiver?: User;    // The user who received the request
    createdAt: Date;
    updatedAt: Date;
    username: string;
    profilePicture: string;
}