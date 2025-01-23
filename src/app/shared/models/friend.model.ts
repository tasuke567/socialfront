import { User } from './user.model';

export interface Friend {
    id: string;
    userId: string;
    friendId: string;
    user?: User;        // The user who owns this friendship
    friend?: User;      // The friend user
    createdAt: Date;
    updatedAt: Date;
    requested?: boolean;
}