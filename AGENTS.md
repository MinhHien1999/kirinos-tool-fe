<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

🧭 Mục tiêu dự án

Xây dựng website giới thiệu sản phẩm (catalog) với các chức năng chính:

Trang danh sách sản phẩm theo danh mục
Trang chi tiết sản phẩm
Hiển thị nhiều ảnh + video YouTube
Bảng thông số kỹ thuật (specs)
Giao diện responsive (mobile + desktop)
Có trang admin để quản lý sản phẩm
🏗️ Kiến trúc tổng thể
Frontend
Framework: Next.js (App Router)
Styling: TailwindCSS
Data fetching: Server Components / fetch API
Backend
Next.js API routes (hoặc Express nếu tách riêng)
Database: MongoDB
🧱 Cấu trúc thư mục
app/
layout.jsx
page.jsx
product/
[slug]/
page.jsx

components/
Header.jsx
ProductCard.jsx
ProductGallery.jsx
SpecsTable.jsx

lib/
mongodb.js

models/
Product.js

app/api/
products/
route.js
🗄️ Database Schema
Product
{
name: String,
slug: String,
description: String,

category: {
id: ObjectId,
name: String
},

brand: {
id: ObjectId,
name: String
},

price: Number,
status: String, // in_stock | out_of_stock

images: [
{
type: "image" | "youtube",
url: String
}
],

specs: [
{
label: String,
value: String
}
],

createdAt: Date
}
🖼️ Quy chuẩn hiển thị ảnh & video
Gallery
Tối đa: 9 items
Hỗ trợ:
ảnh (type: image)
video YouTube (type: youtube)
Thumbnail:
ảnh → dùng trực tiếp
youtube → https://img.youtube.com/vi/{id}/0.jpg
Khi click:
ảnh → hiển thị ảnh lớn
youtube → render iframe
📄 Trang danh sách sản phẩm
Yêu cầu
Hiển thị theo danh mục
Grid responsive:
mobile: 1-2 cột
tablet: 2-3 cột
desktop: 4 cột
Component
ProductCard
ảnh
tên
giá (optional)
📄 Trang chi tiết sản phẩm
Layout
[Gallery trái] | [Thông tin phải]
Bao gồm:
Gallery (ảnh + video)
Tên sản phẩm
Thông tin nhanh:
thương hiệu
model
xuất xứ
Giá
Trạng thái
Tabs
Chi tiết sản phẩm
Nhận xét (optional)
📊 Specs Table
Dữ liệu từ specs[]
Render dạng bảng 2 cột:
Label | Value
Style:
cột trái nền xám
border rõ ràng
🧩 Component cần có
Header
Logo (image trong /public)
Hotline
Responsive
ProductGallery
Hiển thị ảnh lớn
Thumbnail bên dưới
Zoom ảnh (optional)
Hỗ trợ video YouTube
SpecsTable
Render từ specs[]
Không hardcode field
🛠️ Admin Panel
Route
/admin/products
/admin/products/create
/admin/products/edit/:id
Form sản phẩm
Thông tin cơ bản
name
category
brand
status
Images
upload nhiều ảnh
nhập link YouTube
Specs (dynamic)
thêm / xoá dòng
mỗi dòng gồm:
label
value
CRUD API
GET /api/products
GET /api/products/:slug
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
🚀 Quy tắc phát triển

1. Không hardcode dữ liệu
   tất cả lấy từ database
2. Tối ưu ảnh
   dùng next/image
   cấu hình domain nếu dùng external
3. Không lưu ảnh trong DB
   chỉ lưu URL
4. Code clean
   tách component nhỏ
   không viết logic lớn trong page
5. Responsive bắt buộc
   mobile-first
   test trên nhiều kích thước
   ⚡ Best Practices
   dùng slug cho URL SEO
   giới hạn số ảnh (<= 9)
   validate input admin
   loading + error state
   🔥 Mở rộng sau này
   filter theo category
   tìm kiếm
   pagination
   đánh giá sản phẩm
   auth admin
