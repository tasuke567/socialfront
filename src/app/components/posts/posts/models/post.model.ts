export interface Post {
    id: string;
    title: string;  
    userId: string;
    content: string;
    createdAt: Date; // หรือ Date ถ้าคุณแปลงแล้ว
    updatedAt?: Date;
    username: string;
    profilePicture: string;
  }