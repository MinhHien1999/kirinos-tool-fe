# Kirinos Admin Panel

Giao diện quản trị cho hệ thống Kirinos Tool được xây dựng bằng **Next.js** với **Tailwind CSS**.

## ✨ Tính năng

### 🔐 Xác thực & Đăng nhập

- ✅ **Đăng kí tài khoản** mới với validation
- ✅ **Đăng nhập** với email và mật khẩu
- ✅ **Access Token** (15 phút): Dùng cho các API request
- ✅ **Refresh Token** (30 ngày): Lưu trữ trong database, dùng để cấp lại access token
- ✅ **Token phân biệt**: Access token và Refresh token có ký tự khác nhau (thêm field `type`)
- ✅ **Bảo vệ routes**: Tự động redirect nếu chưa đăng nhập
- ✅ **Ngăn chặn vào trang auth**: Redirect về /admin nếu đã đăng nhập (AuthGuard)
- ✅ **Redirect theo role**: Admin → /admin, User → / (có thể mở rộng)
- ✅ **Đăng xuất an toàn**: Xóa tokens khỏi database và localStorage
- ✅ **Auto-refresh token**: Tự động cấp lại access token khi hết hạn

### 🏠 Dashboard

- **Thống kê tổng quan**: Số lượng sản phẩm, thương hiệu, hóa đơn, doanh thu
- **Hoạt động gần đây**: Theo dõi các thay đổi hệ thống
- **Thao tác nhanh**: Truy cập nhanh đến các chức năng chính
- **Hiển thị tài khoản**: Hiển thị email người dùng tại sidebar

### 📦 Quản lý sản phẩm

- ✅ **Xem danh sách** sản phẩm với phân trang
- ✅ **Tìm kiếm** theo tên sản phẩm
- ✅ **Lọc** theo thương hiệu và trạng thái
- ✅ **Thêm sản phẩm** mới với form validation và dropdown chọn brand/category
- ✅ **Chỉnh sửa** thông tin sản phẩm với auto-generate slug và dropdown
- ✅ **Xóa sản phẩm** với xác nhận
- ✅ **Hiển thị hình ảnh** và thông tin chi tiết
- ✅ **Auto-generate slug** từ tên sản phẩm với tùy chọn random

### 🏷️ Quản lý thương hiệu

- ✅ **Xem danh sách** thương hiệu với phân trang
- ✅ **Tìm kiếm** theo tên thương hiệu
- ✅ **Lọc** theo trạng thái hoạt động
- ✅ **Thêm thương hiệu** mới
- ✅ **Chỉnh sửa** thông tin thương hiệu
- ✅ **Xóa thương hiệu** với xác nhận
- ✅ **Auto-generate slug** từ tên thương hiệu với tùy chọn random

### 📂 Quản lý danh mục

- ✅ **Xem danh sách** danh mục với phân trang
- ✅ **Tìm kiếm** theo tên danh mục
- ✅ **Thêm danh mục** mới với auto-generate slug
- ✅ **Chỉnh sửa** thông tin danh mục
- ✅ **Xóa danh mục** với xác nhận
- ✅ **Hỗ trợ danh mục con** (parent category)
- ✅ **Hiển thị phân cấp** rõ ràng danh mục cha/con

## 🎨 Giao diện

- **Layout responsive** cho desktop và mobile
- **Navigation sidebar** với menu dễ sử dụng
- **Modal forms** cho thêm/sửa dữ liệu
- **Status badges** với màu sắc trực quan
- **Loading states** và error handling
- **Pagination** với điều hướng thuận tiện

## 🚀 Cách sử dụng

### Đăng nhập/Đăng kí

1. **Trang đăng kí**: `http://localhost:3000/auth/register`
   - Điền email, mật khẩu (tối thiểu 6 ký tự), tên
   - Nhấn "Đăng kí" → tự động đăng nhập → chuyển đến `/admin`

2. **Trang đăng nhập**: `http://localhost:3000/auth/login`
   - Điền email và mật khẩu
   -Authentication (Backend: `/api/auth`)

- `POST /api/auth/register` - Đăng kí tài khoản
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }
  ```

- `POST /api/auth/login` - Đăng nhập
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  Response: `{ accessToken, refreshToken, user }`

- `POST /api/auth/refresh` - Cấp lại access token
  ```json
  {
    "refreshToken": "token"
  }
  ```
  Response: `{ accessToken }`

- `POST /api/auth/logout` - Đăng xuất (yêu cầu Authorization header)
  ```
  Header: Authorization: Bearer {accessToken}
  Body: { "refreshToken": "token" }
  ```

### Products

- `GET /api/products` - Lấy danh sách sản phẩm (có phân trang, tìm kiếm, lọc)
- `POST /api/products` - Thêm sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

## 🚀 Cách sử dụng

### Đăng nhập/Đăng kí

1. **Trang đăng kí**: `http://localhost:3000/auth/register`
   - Điền email, mật khẩu (tối thiểu 6 ký tự), tên
   - Nhấn "Đăng kí" → tự động đăng nhập → redirect theo role (admin → /admin)

2. **Trang đăng nhập**: `http://localhost:3000/auth/login`
   - Điền email và mật khẩu
   - Nhấn "Đăng nhập" → redirect theo role (admin → /admin)

3. **Bảo mật & Redirect**:
   - Nếu **chưa đăng nhập** → vào được `/auth/login` và `/auth/register`
   - Nếu **đã đăng nhập** → không vào được auth pages, hiển thị "Bạn đã đăng nhập"
   - **Role-based redirect**: Admin → `/admin`, User → `/` (có thể mở rộng)
   - **Token validation**: Kiểm tra expiry khi load từ localStorage

### Sidebar & Đăng xuất

- **Header admin**: Hiển thị email user + dropdown logout
- **Dropdown logout**: Click email → hiện menu với nút "🚪 Đăng xuất"
- **Đăng xuất an toàn**: Xóa tokens và quay lại trang đăng nhập

### Quản lý Admin

1. **Truy cập admin**: `http://localhost:3000/admin` (cần đăng nhập)
2. **Dashboard**: Xem tổng quan hệ thống
3. **Sản phẩm**: Quản lý danh mục sản phẩm
4. **Thương hiệu**: Quản lý các thương hiệu
5. **Danh mục**: Quản lý danh mục sản phẩm

## 🔧 API Endpoints

### Authentication (Backend: `/api/auth`)

- `POST /api/auth/register` - Đăng kí tài khoản
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }
  ```

- `POST /api/auth/login` - Đăng nhập
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  Response: `{ accessToken, refreshToken, user }`

- `POST /api/auth/refresh` - Cấp lại access token
  ```json
  {
    "refreshToken": "token"
  }
  ```
  Response: `{ accessToken }`

- `POST /api/auth/logout` - Đăng xuất (yêu cầu Authorization header)
  ```
  Header: Authorization: Bearer {accessToken}
  Body: { "refreshToken": "token" }
  ```

### Products

### Brands

- `GET /api/brands` - Lấy danh sách thương hiệu (có phân trang, tìm kiếm, lọc)
- `POST /api/brands` - Thêm thương hiệu mới
- `PUT /api/brands/:id` - Cập nhật thương hiệu
- `DELETE /api/brands/:id` - Xóa thương hiệu

### Categories

- `GET /api/categories` - Lấy danh sách danh mục (có phân trang, tìm kiếm)
- `POST /api/categories` - Thêm danh mục mới
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

## 📱 Responsive Design

- **Desktop**: Layout đầy đủ với sidebar
- **Tablet**: Điều chỉnh layout cho màn hình trung bình
- **Mobile**: Menu collapsible và form responsive

## 🔐 Bảo mật & Token Management

### Token Strategy

- **Access Token** (15 phút):
  - Payload: `{ userId, email, role, type: 'access' }`
  - Dùng cho authentication API requests
  - Lưu trong localStorage
  - Có thể thu hồi nhanh khi cần

- **Refresh Token** (30 ngày):
  - Payload: `{ userId, type: 'refresh' }`
  - Lưu trong database (collection `users.refreshTokens`)
  - Dùng để cấp lại access token
  - Có thời hạn hết hạn và được xóa tự động khỏi DB

### Token Phân biệt

- **Access token** và **Refresh token** có ký tự khác nhau
- Mỗi token có field `type` riêng để dễ phân biệt
- Access token có thêm thông tin user (`email`, `role`)
- Refresh token chỉ chứa `userId` để giảm payload

### Security Features

- ✅ **Password hashing**: Dùng bcryptjs (10 rounds salt)
- ✅ **Token verification**: Verify JWT signature
- ✅ **Database token storage**: Refresh tokens lưu trong DB
- ✅ **Token expiry validation**: Kiểm tra hạn sử dụng
- ✅ **Logout token cleanup**: Xóa token khỏi DB khi logout
- ✅ **Auto-refresh mechanism**: Tự động cấp lại access token
- ✅ **Role-based access**: Kiểm tra role khi access endpoints
- ✅ **Input validation**: Validate email, password, data

---

**Built with ❤️ for Kirinos Tool Admin Panel**
