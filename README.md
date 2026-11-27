# SocialHub — Omnichannel Social Media Automation & Content Platform

Hệ thống quản lý, tự động hóa và sáng tạo nội dung đa kênh: **Facebook Fanpage, YouTube Shorts Comic Studio, Affiliate Studio (Shopee & TikTok)**.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🎬 YouTube Shorts Comic Studio (Truyện Tranh 9:16 Dọc)
- **AI Story Generator:** Tự động lên cốt truyện ngụ ngôn 11 khung hình (11 panels) giàu cảm xúc và triết lý nhân sinh theo phong cách kinh điển.
- **Prompt Exporter:** Tự động lắp ráp prompt vẽ tranh đa khung hoàn chỉnh cho Midjourney v6.1 / Ideogram / DALL-E 3 với bong bóng thoại chuẩn xác.
- **Tự Động Hóa Xuất Video Shorts MP4 (100% Automatic):**
  - **🔍 Chế độ Zoom Từng Ô Tranh (Khuyên dùng):** Tự động nhận diện và cắt từng ô thoại theo thứ tự đọc Z-pattern, đặt vừa vặn giữa khung hình dọc 1080x1920 với hiệu ứng Ken Burns zoom nhẹ nhàng và nền mờ nghệ thuật.
  - **📜 Chế độ Cuộn Dọc Toàn Trang:** Giữ nguyên 100% bề ngang, cuộn êm đềm từ đỉnh xuống chân trang mà không cắt xén chữ.

### 2. 🛍️ Affiliate Hub (Shopee & TikTok Studio)
- Quản lý sản phẩm tiếp thị liên kết đa sàn.
- Smart Redirect Tracking Link (`/api/affiliate/r/:id`): Bảo toàn 100% cookie hoa hồng, đếm click thời gian thực.
- Báo cáo chuyển đổi và doanh thu.

### 3. 📰 Radar Bắt Trend & Spy Fanpage Facebook
- Cào tin tức thời sự từ các đầu báo lớn (VnExpress, Tuổi Trẻ, Dân Trí...).
- Spy bài đăng viral và tần suất đăng bài của bất kỳ Fanpage đối thủ.
- AI viết lại bài đăng mạng xã hội chuẩn giọng điệu viral kèm hashtag.

### 4. 📢 Facebook Page Management & Scheduler
- Đăng bài tự động lên Fanpage Facebook.
- Lên lịch đăng bài tự động (Scheduler).
- Quản lý kho Media tập trung.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React 19, Tailwind CSS v4, Vite, Lucide Icons, Axios.
- **Backend:** Node.js, Express, Multer, Puppeteer Core.
- **AI Engine:** Google Gemini AI API (`gemini-3.5-flash-lite`).
- **Video Rendering Engine:** Python 3 + OpenCV (nhận diện khung hình) + FFmpeg Server (xuất video H.264 MP4 1080x1920).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Cài đặt Dependencies:
```bash
# Cài đặt backend
cd backend
npm install

# Cài đặt frontend
cd ../frontend
npm install
```

### 2. Cấu hình biến môi trường:
Tạo file `.env` trong thư mục `backend/` dựa trên mẫu `.env.example`:
```env
PORT=5000
FB_PAGE_ID=your_facebook_page_id
FB_PAGE_TOKEN=your_facebook_page_token
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Khởi động dự án:
Chạy file `start.bat` ở thư mục gốc hoặc chạy từng dịch vụ:
```bash
# Terminal 1: Backend
cd backend && node src/server.js

# Terminal 2: Frontend
cd frontend && npm run dev
```

Truy cập hệ thống tại: `http://localhost:3000`
Backend API chạy tại: `http://localhost:5000`
