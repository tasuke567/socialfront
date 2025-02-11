export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    createdAt: Date;
    updatedAt: Date;
}