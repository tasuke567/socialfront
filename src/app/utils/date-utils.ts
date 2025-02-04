// utils/date-utils.ts

// ฟังก์ชันสำหรับแปลงวันที่
export function formatDate(dateObj: any): string {
  try {
    const { year, month, day, hour, minute, second } = dateObj;
    const date = new Date(
      year.low,   // ปี
      month.low - 1, // เดือน (ลด 1 เพราะเดือนเริ่มจาก 0)
      day.low, // วัน
      hour.low, // ชั่วโมง
      minute.low, // นาที
      second.low // วินาที
    );
    return date.toLocaleString();  // คืนค่าการแสดงวันที่
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date'; // หากแปลงไม่ได้
  }
}



// ฟังก์ชันแปลงวันที่ให้เป็นสตริงในรูปแบบที่เราต้องการ เช่น 'YYYY-MM-DD'
export function formatToDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');  // เดือนต้องบวก 1 เพราะเดือนเริ่มจาก 0
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// ฟังก์ชันแปลงเวลาให้เป็นสตริงในรูปแบบ 'HH:MM:SS'
export function formatToTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

// ฟังก์ชันแปลงวันที่ให้เป็นรูปแบบที่เหมาะสมในการแสดงผล เช่น 'dd/MM/yyyy HH:mm:ss'
export function formatToFullDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// ฟังก์ชันแปลงวันที่จาก timestamp (milliseconds)
export function formatFromTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return formatToFullDateTime(date);  // ใช้ฟังก์ชัน formatToFullDateTime ที่เราสร้าง
}
