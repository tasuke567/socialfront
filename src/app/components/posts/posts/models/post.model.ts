export interface Post {
  id: string;
  title: string;  
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  owner: {
    id: string;
    username: string;
    profilePicture: any;
  };
  comments: Comment[];  
  showCommentSection?: boolean;
  likedBy: any[];   
}

export interface Comment {
  id: string;
  userId: string;
  postId: string; 
  username: string;
  content: string;
  createdAt: Date;
  profilePicture?: string;
}

export interface User {
  id: string;
  username: string;
  profilePicture: any;
}
