export interface Post {
  id: string;
  title: string;  
  content: string;
  created_at: Date;
  updated_at?: Date;
  ownerId: string; // ✅ UUID ของเจ้าของโพสต์
  username: string; // ✅ Username ของเจ้าของโพสต์
  profile_picture?: string; // ✅ รูปโปรไฟล์ของเจ้าของโพสต์

  comment_count: number; // ✅ จำนวนคอมเมนต์ (โหลดเร็วกว่าดึงทั้งคอมเมนต์)
  like_count: number; // ✅ จำนวนไลก์
  share_count: number; // ✅ จำนวนแชร์

  comments?: Comment[]; // ✅ โหลดเฉพาะเมื่อเปิดดูคอมเมนต์
  show_comment_section?: boolean; // ✅ ควบคุม UI สำหรับเปิด/ปิดคอมเมนต์
  liked_by_user?: boolean; // ✅ ใช้แทน `isLikedByCurrentUser()` ใน UI
}

export interface Comment {
  id: string;
  post_id: string; 
  user_id: string; 
  username: string; // ✅ Username ของคนที่คอมเมนต์
  content: string;
  created_at: Date;
  profile_picture?: string; // ✅ รูปโปรไฟล์ของคนที่คอมเมนต์
}

export interface User {
  id: string;
  username: string;
  profile_picture?: string;
}

export interface CommentDTO {
  id: string;
  userId: string;
  postId: string;
  username: string;
  content: string;
  createdAt: Date;
}
