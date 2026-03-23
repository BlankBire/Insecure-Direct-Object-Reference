const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Tạo database mới cho lab e-commerce
const db = new sqlite3.Database("./ecommerce_idor.db");

db.serialize(() => {
  // 1. Bảng Users
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username TEXT UNIQUE, 
        password TEXT
    )`);

  // 2. Bảng Orders
  db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        user_id INTEGER, 
        product_name TEXT, 
        price INTEGER,
        shipping_address TEXT,
        phone_number TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

  console.log("Đã khởi tạo DB E-commerce trống!");
});

// --- API XÁC THỰC ---
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    function (err) {
      if (err) return res.status(400).json({ error: "Username đã tồn tại" });
      res.json({ message: "Đăng ký thành công", userId: this.lastID });
    },
  );
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT id, username FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, user) => {
      if (user) res.json({ message: "Đăng nhập thành công", token: user.id });
      else res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
    },
  );
});

// Middleware xác thực
const checkAuth = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Bạn chưa đăng nhập!" });
  req.currentUserId = token;
  next();
};

// --- API MUA HÀNG ---
app.post("/api/checkout", checkAuth, (req, res) => {
  const { cart, address, phone } = req.body;
  const userId = req.currentUserId;

  if (!cart || cart.length === 0)
    return res.status(400).json({ error: "Giỏ hàng trống" });
  if (!address || !phone)
    return res.status(400).json({ error: "Thiếu địa chỉ hoặc số điện thoại" });

  const stmt = db.prepare(
    "INSERT INTO orders (user_id, product_name, price, shipping_address, phone_number) VALUES (?, ?, ?, ?, ?)",
  );
  cart.forEach((item) => stmt.run(userId, item.name, item.price, address, phone));
  stmt.finalize();

  console.log(`User ID ${userId} đã đặt hàng thành công!`);
  res.json({ message: "Đặt hàng thành công!" });
});

// --- API LỖI IDOR (XEM ĐƠN HÀNG) ---
// Lỗ hổng: Backend tin tưởng hoàn toàn vào 'targetUserId' trên URL API
app.get("/api/orders/:targetUserId", checkAuth, (req, res) => {
  const targetUserId = req.params.targetUserId;
  console.log(
    `[BACKEND] User ID ${req.currentUserId} đang request xem đơn hàng của User ID ${targetUserId}`,
  );

  // LỖI Ở ĐÂY: Hàm không kiểm tra xem targetUserId có bằng với req.currentUserId hay không!
  db.all(
    `SELECT orders.*, users.username as buyer_name FROM orders JOIN users ON orders.user_id = users.id WHERE user_id = ?`,
    [targetUserId],
    (err, rows) => {
      res.json({ data: rows });
    },
  );
});

app.listen(3000, () => console.log("E-commerce Backend chạy ở port 3000"));
