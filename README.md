# TechStore IDOR

Một dự án mô phỏng thực tế lỗ hổng **Insecure Direct Object Reference (IDOR)** trên một ứng dụng E-commerce được xây dựng bằng React.js và Node.js.

Dự án này được thiết kế để giúp mọi người hiểu rõ từ lý thuyết đến thực hành: cách mà một lỗ hổng IDOR hình thành từ phía Backend, cách nó được khai thác, và hậu quả khủng khiếp khi nó làm rò rỉ dữ liệu cá nhân của người dùng.

---

## 1. Lý thuyết: IDOR là gì?

**IDOR (Insecure Direct Object Reference)** - Tham chiếu đối tượng trực tiếp không an toàn, xảy ra khi một ứng dụng cung cấp quyền truy cập trực tiếp vào các đối tượng (database records, files, user data...) dựa trên dữ liệu đầu vào do người dùng cung cấp (như ID trên URL, ID trong body JSON) nhưng lại không kiểm tra xem người dùng đó có quyền truy cập vào đối tượng hay không.

### Tác động trong bài Lab này:
Trong các trang E-commerce, lịch sử đơn hàng là nơi chứa những thông tin cực kỳ nhạy cảm. Trong dự án này, lỗ hổng IDOR cho phép Hacker xem trộm đơn hàng của người khác, qua đó làm rò rỉ các thông tin PII:
- Vị trí/Địa chỉ nhà riêng.
- Số điện thoại cá nhân.
- Lịch sử mua sắm và số tiền đã chi tiêu.

Hậu quả: Leo thang trực tiếp mức độ nghiêm trọng của lỗi thành High/Critical.

---

## 2. Cấu trúc dự án

Dự án gồm 2 phần độc lập:
- **Backend (`/server.js`)**: Viết bằng Node.js (Express) và sử dụng SQLite để làm Database. Code được cố tình viết sai logic kiểm tra phân quyền để tạo ra lỗ hổng IDOR.
- **Frontend (`/idor-frontend`)**: Giao diện người dùng viết bằng React (Vite).

---

## 3. Hướng dẫn cài đặt & Khởi động

Yêu cầu hệ thống: Đã cài đặt [Node.js](https://nodejs.org/).

### Bước 1: Khởi động Backend
1. Mở Terminal, trỏ vào thư mục gốc của dự án.
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install express sqlite3 cors
   ```
3. Chạy server:
   ```bash
   node server.js
   ```
   *Lưu ý: Hệ thống sẽ tự động tạo một file `ecommerce_idor.db` trắng để lưu trữ dữ liệu.* (Backend chạy tại `http://localhost:3000`)

### Bước 2: Khởi động Frontend
1. Mở một Terminal khác, trỏ vào thư mục frontend:
   ```bash
   cd idor-frontend
   ```
2. Cài đặt node_modules:
   ```bash
   npm install
   ```
3. Chạy môi trường Dev:
   ```bash
   npm run dev
   ```
   *Frontend sẽ chạy tại `http://localhost:5173`*. Mở link này trên trình duyệt để bắt đầu.

---

## 4. Hướng dẫn thực hành khai thác

Để nhìn thấy rõ lỗ hổng, hãy đóng vai là 2 người dùng khác nhau: **Nạn Nhân (Victim)** và **Kẻ tấn công (Attacker)**.

### Kịch bản (Khai thác rò rỉ PII của Victim)
1. **[Victim] Tạo dữ liệu mục tiêu:**
   - Vào trình duyệt, đăng ký tài khoản thứ nhất (Ví dụ: `victim`). Vì là user đầu tiên, hệ thống sẽ gán User ID cho người này là `1`.
   - Đăng nhập vào `victim`, mua một vài món hàng.
   - Checkout và nhập đầy đủ **Địa chỉ nhà** và **Số điện thoại thật**.
   - Bấm vào "Lịch sử đơn hàng" trên Navbar. Lúc này thanh địa chỉ (URL) của trình duyệt sẽ hiển thị: `http://localhost:5173/orders/1`. 
   - Đăng xuất.

2. **[Attacker] Thực hiện tấn công IDOR:**
   - Đăng ký một tài khoản thứ hai (Ví dụ: `hacker`). Tài khoản này có User ID là `2`.
   - Đăng nhập vào `hacker`. Nếu vào "Lịch sử đơn hàng", URL sẽ là `http://localhost:5173/orders/2` và báo "Không có đơn hàng nào".
   - Tấn công: Đưa chuột lên thanh địa chỉ của trình duyệt, sửa số `2` thành số `1`: `http://localhost:5173/orders/1` và bấm Enter.
   - Giao diện ngay lập tức load ra toàn bộ danh sách đơn hàng được mua bởi `victim`, kèm theo địa chỉ nhà và số điện thoại thật của họ phơi bày ra trước mắt dù đang ở trong phiên đăng nhập của `hacker`.

### Giải thích nguyên nhân gốc rễ
Nếu mở file `server.js`, tìm đến dòng API `/api/orders/:targetUserId` thì sẽ thấy đoạn code SQL sau:
```javascript
  db.all(
    `SELECT orders.*, users.username as buyer_name FROM orders JOIN users ON orders.user_id = users.id WHERE user_id = ?`,
    [targetUserId], ...
```
**Lỗi ở đâu?** Lập trình viên đã nhận tham số `targetUserId` trực tiếp từ phía Front-end gửi lên để truy vấn Database, mà bỏ quên mất việc phải đối chiếu xem `targetUserId` này có bằng với `req.currentUserId` (người dùng đang đăng nhập) hay không. Do đó, Attacker muốn xem của ai, chỉ việc gửi ID của người đó lên!

---
