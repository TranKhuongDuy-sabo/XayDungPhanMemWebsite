import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './index.css';

// ==========================================
// 1. THANH MENU CHUYỂN TRANG
// ==========================================
function NavBar() {
  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
      <Link to="/users" className="btn btn-primary" style={{ textDecoration: 'none' }}>
        👥 Quản lý Users (Nộp bài)
      </Link>
      <Link to="/products" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
        💻 Quản lý Sản phẩm
      </Link>
    </div>
  );
}

// ==========================================
// 2. TRANG QUẢN LÝ USERS (Dành cho thầy cô chấm điểm)
// ==========================================
function UserManager() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.ok ? res.json() : Promise.reject('Lỗi server'))
      .then(data => setUsers(data))
      .catch(err => setErrorMsg(err));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(() => { setName(''); fetchUsers(); });
  };

  return (
    <div className="card">
      <div className="header">
        <h1 className="title">Danh sách Users</h1>
        <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Hệ thống</span>
      </div>
      {errorMsg && <div className="error-box">⚠️ {errorMsg}</div>}
      
      <form onSubmit={handleSubmit} className="form-inline" style={{ marginBottom: '20px' }}>
        <input type="text" className="input-field" placeholder="Nhập tên User mới..." value={name} onChange={e => setName(e.target.value)} required />
        <button type="submit" className="btn btn-primary">Thêm</button>
      </form>

      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th className="th">ID</th><th className="th">Tên User</th><th className="th-center">Chi tiết</th></tr></thead>
          <tbody>
            {users.length > 0 ? users.map(u => (
              <tr key={u.id} className="tr">
                <td className="td-id">#{u.id}</td>
                <td className="td-name">{u.name}</td>
                <td className="td-actions">
                  <Link to={`/users/${u.id}`} className="btn-icon btn-secondary" style={{ textDecoration: 'none' }}>Xem</Link>
                </td>
              </tr>
            )) : <tr><td colSpan="3" className="empty-cell">Chưa có ai.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 3. TRANG CHI TIẾT 1 USER (/users/1)
// ==========================================
function UserDetail() {
  const { id } = useParams(); // Lấy số 1 trên thanh địa chỉ xuống
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data));
  }, [id]);

  return (
    <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
      {user ? (
        <div>
          <div style={{ fontSize: '80px', marginBottom: '10px' }}>👤</div>
          <p className="badge" style={{ display: 'inline-block' }}>User ID: #{user.id}</p>
          <h2 style={{ fontSize: '28px', margin: '10px 0' }}>{user.name}</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/users')} style={{ marginTop: '20px' }}>⬅ Quay lại</button>
        </div>
      ) : <div className="error-box">Không tìm thấy User!</div>}
    </div>
  );
}

// ==========================================
// 4. TRANG QUẢN LÝ SẢN PHẨM CŨ (Của bạn)
// ==========================================
function ProductManager() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => setProducts(data));
  }, []);

  return (
    <div className="card">
      <div className="header">
        <h1 className="title">Danh sách Sản phẩm</h1>
        <span className="badge">Công nghệ</span>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th className="th">ID</th><th className="th">Tên SP</th><th className="th-right">Giá ($)</th></tr></thead>
          <tbody>
            {products.length > 0 ? products.map(p => (
              <tr key={p.id} className="tr"><td className="td-id">#{p.id}</td><td className="td-name">{p.name}</td><td className="td-price">${p.price}</td></tr>
            )) : <tr><td colSpan="3" className="empty-cell">Chưa có sản phẩm.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// CHƯƠNG TRÌNH CHÍNH
// ==========================================
function App() {
  return (
    <Router>
      <div className="container" style={{ flexDirection: 'column', alignItems: 'center' }}>
        <NavBar />
        <Routes>
          <Route path="/" element={<UserManager />} /> {/* Mặc định vào trang Users */}
          <Route path="/users" element={<UserManager />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/products" element={<ProductManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;