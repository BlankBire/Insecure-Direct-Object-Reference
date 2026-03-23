import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import "./App.css";
import logo from "./assets/react.svg";

// Hỗ trợ ảnh lấy từ placehold.co tạm thời
const PRODUCTS = [
  { id: 1, name: "Bàn phím cơ Custom", price: 1500000, desc: "Gõ cực êm, led RGB xịn xò", img: "https://epomaker.com/cdn/shop/products/87_-_--1.jpg?v=1622527041" },
  { id: 2, name: "Chuột Gaming Logitech", price: 800000, desc: "DPI cao, siêu nhạy, form công thái học", img: "https://tse4.mm.bing.net/th/id/OIP.pk670c4bV3fWs_2Fde9geQHaDt?w=1600&h=800&rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 3, name: "Màn hình 144Hz 24inch", price: 3200000, desc: "Chơi game mượt mà, viền siêu mỏng", img: "https://www.lg.com/us/images/monitors/md07518647/features/mnt-24gn600-06-2-stylish-design-d.jpg" },
  { id: 4, name: "Tai nghe True Wireless", price: 550000, desc: "Chống ồn chủ động (ANC)", img: "https://cdn.tgdd.vn/Products/Images/54/286045/tai-nghe-bluetooth-true-wireless-galaxy-buds2-pro-100822-095902.jpg" },
  { id: 5, name: "Lót chuột Razer", price: 200000, desc: "Size XL bao trọn cả bàn phím", img: "https://www.tnc.com.vn/uploads/product/vy2023/mieng-lot-chuot-razer-goliathus-extended-chroma.png" },
  { id: 6, name: "Micro thu âm USB", price: 950000, desc: "Loại bỏ tạp âm chuẩn Studio", img: "https://cloudadmin.rockshop.co.nz/media/catalog/product/s/h/shusm7b-0.jpg?width=770" },
];

const Message = ({ msg }) =>
  msg.text ? (
    <div
      className={`message-toast ${msg.type === "error" ? "error" : "success"}`}
    >
      {msg.text}
    </div>
  ) : null;

// ==========================================
// CART MODAL COMPONENT
// ==========================================
const CartModal = ({ isOpen, onClose, cart, setCart, checkout }) => {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const removeItem = (indexToRemove) => {
    setCart(cart.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCheckoutSubmit = () => {
    if (!address || !phone) {
      alert("Vui lòng nhập đầy đủ địa chỉ và số điện thoại.");
      return;
    }
    checkout(address, phone);
    setStep(1);
    setAddress("");
    setPhone("");
  };

  const handleClose = () => {
    onClose();
    setStep(1);
  };

  return (
    <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={handleClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3>{step === 1 ? "Giỏ hàng của bạn" : "Thông tin giao hàng"}</h3>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        <div className="cart-body">
          {step === 1 ? (
            cart.length === 0 ? (
              <div style={{textAlign: 'center', color: '#adb5bd', marginTop: '40px'}}>
                Chưa có sản phẩm nào
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {cart.map((item, idx) => (
                  <div key={idx} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-price">{item.price.toLocaleString()} đ</span>
                    </div>
                    <button onClick={() => removeItem(idx)} className="cart-item-delete">
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", padding: "10px 0" }}>
              <input 
                type="text" 
                className="checkout-input" 
                placeholder="Địa chỉ giao hàng" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
              />
              <input 
                type="tel" 
                className="checkout-input" 
                placeholder="Số điện thoại" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
              />
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            {step === 1 ? (
              <>
                <div className="cart-total">
                  <span>Tổng cộng:</span>
                  <span style={{color: '#0d6efd'}}>{total.toLocaleString()} VNĐ</span>
                </div>
                <div className="cart-actions">
                  <button onClick={() => setCart([])} className="btn secondary">
                    Xóa tất cả
                  </button>
                  <button onClick={() => setStep(2)} className="btn primary">
                    Đặt hàng
                  </button>
                </div>
              </>
            ) : (
              <div className="cart-actions">
                <button className="btn outline block" onClick={() => setStep(1)} style={{flex: 1}}>Trở lại</button>
                <button className="btn primary block" onClick={handleCheckoutSubmit} style={{flex: 1}}>Xác nhận</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// ==========================================
// 1. MÀN HÌNH ĐĂNG NHẬP / SHOPPING
// ==========================================
const ShopView = ({ token, cart, setCart }) => {
  if (!token) {
    return (
      <div className="unauth-box">
        <h2 className="title" style={{marginBottom: 10, textAlign: 'center'}}>Chào mừng trở lại</h2>
        <p className="sub-title" style={{fontSize: '1rem', marginTop: 0}}>Vui lòng đăng nhập để tiếp tục mua sắm</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: '20px' }}>
          <Link to="/login" className="btn primary">
            Đăng nhập ngay
          </Link>
          <Link to="/register" className="btn secondary">
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <div className="products-section">
        <div className="product-list">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="product-card">
              <img src={p.img} alt={p.name} className="product-image" />
              <div className="product-info-wrapper">
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-desc">{p.desc}</div>
                  <div className="product-price">
                    {p.price.toLocaleString()} VNĐ
                  </div>
                </div>
                <button
                  onClick={() => setCart([...cart, p])}
                  className="btn ghost"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MÀN HÌNH XEM ĐƠN HÀNG
// ==========================================
const OrdersView = ({ token, showMsg }) => {
  const { userId } = useParams();
  const [ordersData, setOrdersData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/orders/${userId}`, {
          headers: { Authorization: token },
        });
        const data = await res.json();
        if (res.ok) setOrdersData(data.data);
        else showMsg(data.error);
      } catch (err) {
        console.error(err);
        showMsg("Lỗi tải đơn hàng!");
      }
    };
    fetchOrders();
  }, [userId, token, showMsg]);

  if (!token)
    return (
      <div className="unauth-box">
        <h3 className="title" style={{textAlign: 'center'}}>Bạn chưa đăng nhập</h3>
        <button onClick={() => navigate("/login")} className="btn primary">Đi đến Đăng nhập</button>
      </div>
    );

  return (
    <div className="orders-view">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <h2 className="title" style={{margin: 0, textAlign: 'left'}}>Lịch sử mua hàng</h2>
        <button
          onClick={() => navigate("/")}
          className="btn secondary small"
        >
          &larr; Quay lại Shop
        </button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <h4 style={{fontSize: '1.2rem', marginBottom: '15px', color: '#1a1a1a'}}>Danh sách đơn hàng của bạn:</h4>
        {ordersData.length === 0 ? (
          <div style={{padding: '30px', textAlign: 'center', background: '#f8f9fa', borderRadius: '12px', color: '#6c757d'}}>
            Không có đơn hàng nào.
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Người mua</th>
                <th>Địa chỉ</th>
                <th>SĐT</th>
                <th style={{ textAlign: "right" }}>Giá tiền</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((order, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{order.product_name}</td>
                  <td>
                    <span style={{background: '#e9ecef', padding: '4px 10px', borderRadius: '4px', fontSize: '0.95rem', fontWeight: 600}}>
                      {order.buyer_name || `User ${order.user_id}`}
                    </span>
                  </td>
                  <td>{order.shipping_address}</td>
                  <td>{order.phone_number}</td>
                  <td style={{ textAlign: "right", color: '#0d6efd', fontWeight: 600 }}>
                    {order.price.toLocaleString()} VNĐ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN APP
// ==========================================
function App() {
  const [token, setToken] = useState(
    localStorage.getItem("idor_token") || null,
  );
  // Optional: Read username from localStorage explicitly for the navbar
  const username = localStorage.getItem("idor_username") || "User";

  const [msg, setMsg] = useState({ text: "", type: "" });
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const navigate = useNavigate();

  const showMsg = (text, type = "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("idor_token");
    localStorage.removeItem("idor_username");
    setToken(null);
    setCart([]); // Xóa sạch giỏ hàng khi thẻ đăng xuất
    navigate("/");
  };

  const handleCheckout = async (address, phone) => {
    if (cart.length === 0) return showMsg("Chưa có gì trong giỏ hàng!");
    try {
      const res = await fetch("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ cart, address, phone }),
      });
      if (res.ok) {
        setCart([]);
        setIsCartOpen(false); // Đóng ngay modal sau khi mua xong
        showMsg("Xác nhận đặt hàng thành công!", "success");
      }
    } catch (err) {
      console.error(err);
      showMsg("Lỗi thanh toán!");
    }
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-left">
          <img src={logo} alt="logo" />
          <h1 className="app-title" style={{cursor: 'pointer'}} onClick={() => navigate("/")}>TechStore IDOR</h1>
        </div>
        <div className="header-right">
          {token && (
            <>
              <span style={{fontWeight: 600, color: '#0d6efd', marginRight: '10px'}}>
                Người dùng: {username}
              </span>
              <button onClick={() => navigate(`/orders/${token}`)} className="btn ghost small">
                Lịch sử đơn hàng
              </button>
              <button onClick={() => setIsCartOpen(true)} className="btn primary small" style={{position: 'relative'}}>
                Giỏ hàng
                {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
              </button>
              <button onClick={handleLogout} className="btn danger small">
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </header>

      <Message msg={msg} />
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        checkout={handleCheckout}
      />

      <div className="container">
        <Routes>
          <Route
            path="/login"
            element={<Login setToken={setToken} showMsg={showMsg} setCart={setCart} />}
          />
          <Route path="/register" element={<Register showMsg={showMsg} />} />
          <Route
            path="/"
            element={<ShopView token={token} cart={cart} setCart={setCart} />}
          />
          <Route
            path="/orders/:userId"
            element={<OrdersView token={token} showMsg={showMsg} />}
          />
        </Routes>
      </div>
    </div>
  );
}

// Wrapper routing
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}


