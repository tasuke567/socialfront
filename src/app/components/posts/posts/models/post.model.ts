export interface Post {
    id: string;
    title: string;  
    userId: string;
    content: string;
    createdAt: any; // หรือ Date ถ้าคุณแปลงแล้ว
    updatedAt: any;
    username: string;
    profilePicture: string;
  }