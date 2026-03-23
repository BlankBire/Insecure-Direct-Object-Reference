import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Register({ showMsg }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) return showMsg("Mật khẩu xác nhận không khớp");
    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("Đăng ký thành công, vui lòng đăng nhập", "success");
        navigate("/login");
      } else showMsg(data.error);
    } catch (err) {
      console.error(err);
      showMsg("Lỗi kết nối server!");
    }
  };

  return (
    <div className="main-box" style={{ maxWidth: 420 }}>
      <h2 className="title">Đăng ký</h2>
      <form className="auth-form" onSubmit={handleRegister}>
        <input
          className="search-input"
          placeholder="Tài khoản"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="search-input"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="search-input"
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 10 }}>
          <button type="submit" className="btn primary" style={{ width: "100%" }}>
            Đăng ký
          </button>
          <div style={{textAlign: "center"}}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ background: "none", border: "none", color: "#6c757d", cursor: "pointer", fontSize: "0.95rem" }}
            >
              &larr; Quay lại
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
