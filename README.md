# BuildnChill Website

A full-stack Single Page Application (SPA) for the BuildnChill Minecraft server, built with Vite, React, and Bootstrap 5.

## Features

- **Home Page**: Hero carousel, latest news section, and server status
- **About Page**: Information about the server
- **News Page**: Featured post and paginated news grid
- **News Detail Page**: Individual news post view
- **Contact Page**: Contact form
- **Admin Panel**: Protected admin area with CRUD operations for news posts
- **Responsive Design**: Mobile-friendly Bootstrap 5 layout

## Technologies

- **Vite**: Build tool and development server
- **React**: UI framework
- **React Router**: Client-side routing
- **Bootstrap 5**: CSS framework for styling
- **Bootstrap Icons**: Icon library

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. **Cấu hình Supabase** (Bắt buộc):
   - Đọc file `SUPABASE_SETUP.md` để biết cách setup Supabase
   - Tạo file `.env` từ `.env.example` và điền thông tin Supabase
   - Chạy các câu lệnh SQL trong `SUPABASE_SETUP.md` để tạo tables

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Admin Access

- **URL**: `/admin`
- **Username**: `admin`
- **Password**: `admin`

## Features

- ✅ **Supabase Integration**: Dữ liệu được lưu trữ trên Supabase, đồng bộ real-time
- ✅ **Contact Management**: Admin có thể xem và quản lý các liên hệ từ người dùng
- ✅ **Real-time Updates**: Khi Admin đăng bài, tất cả người dùng đều thấy ngay lập tức
- ✅ **Image Upload**: Admin có thể upload ảnh trực tiếp vào nội dung bài viết

## Project Structure

```
buildnchill-website/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable UI components
│   │   ├── TopBar.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/       # Page components
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── News.jsx
│   │   ├── NewsDetail.jsx
│   │   ├── Contact.jsx
│   │   ├── Admin.jsx
│   │   └── Login.jsx
│   ├── data/        # Data files
│   │   └── mockData.json
│   ├── App.jsx      # Main app component
│   ├── main.jsx     # Entry point
│   └── styles.css   # Custom styles
├── index.html
├── package.json
└── vite.config.js
```

## Notes

- News data is stored in `src/data/mockData.json`
- Admin panel changes update the data in memory (simulated persistence)
- Server status is displayed from mock data
- All images use placeholder URLs from Unsplash

