export interface User {
    id: string; // UUID ในรูปแบบ string
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string | null; // รองรับ `null`
    roles?: string; // อาจจำเป็นถ้ามีการจัดการ Role
    createdAt: Date;
    updatedAt: Date;
    accountNonExpired?: boolean;
    accountNonLocked?: boolean;
    credentialsNonExpired?: boolean;
    enabled?: boolean;
    hasInterests?: boolean;
    friendshipStatus?: string;

  }
  
export interface LikedUser {
  id: string;
  username: string;
  profilePicture?: string;  // Optional based on response
  firstName?: string | null;
  lastName?: string | null;
  accountNonLocked: boolean;
  enabled: boolean;
  // Other fields from response can be added as needed
}
  