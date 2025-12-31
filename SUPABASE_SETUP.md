# Hướng Dẫn Cài Đặt Supabase

## Bước 1: Tạo Tài Khoản Supabase

1. Truy cập https://supabase.com
2. Đăng ký/Đăng nhập tài khoản
3. Tạo một project mới (chọn plan Free)

## Bước 2: Lấy Thông Tin Kết Nối

1. Vào **Project Settings** (biểu tượng bánh răng)
2. Vào tab **API**
3. Copy 2 giá trị sau:
   - **Project URL** (ví dụ: `https://xxxxx.supabase.co`)
   - **anon public key** (key dài)

## Bước 3: Tạo File .env

Tạo file `.env` ở thư mục gốc của project với nội dung:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Lưu ý:** Thay `xxxxx` bằng URL thực tế của bạn.

## Bước 4: Tạo Tables trong Supabase

Vào **SQL Editor** trong Supabase và chạy các câu lệnh sau:

### 1. Table `news` (Tin tức)

```sql
CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho date để query nhanh hơn
CREATE INDEX idx_news_date ON news(date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người đều có thể đọc
CREATE POLICY "Anyone can read news" ON news
  FOR SELECT USING (true);

-- Policy: Chỉ admin mới có thể insert/update/delete
-- (Bạn sẽ cần tạo authentication sau nếu muốn bảo mật hơn)
CREATE POLICY "Anyone can insert news" ON news
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update news" ON news
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete news" ON news
  FOR DELETE USING (true);
```

### 2. Table `server_status` (Trạng thái server)

```sql
CREATE TABLE server_status (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'Online',
  players TEXT NOT NULL DEFAULT '0',
  max_players TEXT NOT NULL DEFAULT '500',
  version TEXT NOT NULL DEFAULT '1.20.4',
  uptime TEXT NOT NULL DEFAULT '99.9%',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chỉ có 1 record duy nhất
INSERT INTO server_status (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE server_status ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người đều có thể đọc
CREATE POLICY "Anyone can read server_status" ON server_status
  FOR SELECT USING (true);

-- Policy: Mọi người đều có thể update
CREATE POLICY "Anyone can update server_status" ON server_status
  FOR UPDATE USING (true);
```

### 3. Table `contacts` (Liên hệ từ người dùng)

```sql
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  ign TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người đều có thể insert (gửi liên hệ)
CREATE POLICY "Anyone can insert contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- Policy: Mọi người đều có thể đọc (để admin xem)
CREATE POLICY "Anyone can read contacts" ON contacts
  FOR SELECT USING (true);

-- Policy: Mọi người đều có thể update (để đánh dấu đã đọc)
CREATE POLICY "Anyone can update contacts" ON contacts
  FOR UPDATE USING (true);

### 4. Table `site_settings` (Cài đặt website)

```sql
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  server_ip TEXT DEFAULT 'play.buildnchill.com',
  server_version TEXT DEFAULT '1.20.4',
  contact_email TEXT DEFAULT 'contact@buildnchill.com',
  contact_phone TEXT DEFAULT '+1 (234) 567-890',
  site_title TEXT DEFAULT 'BuildnChill',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người đều có thể đọc
CREATE POLICY "Anyone can read site_settings" ON site_settings
  FOR SELECT USING (true);

-- Policy: Mọi người đều có thể update (để admin sửa)
CREATE POLICY "Anyone can update site_settings" ON site_settings
  FOR UPDATE USING (true);
```

## Bước 5: Khởi Động Lại Server

Sau khi tạo file `.env`, khởi động lại dev server:

```bash
npm run dev
```

## Lưu Ý Bảo Mật

- File `.env` đã được thêm vào `.gitignore` để không commit lên Git
- `anon key` là public key, an toàn để dùng ở client-side
- Nếu muốn bảo mật hơn, bạn có thể tạo authentication và dùng service role key ở server-side

## Kiểm Tra Kết Nối

Sau khi setup xong, mở browser console và kiểm tra xem có lỗi kết nối Supabase không.

