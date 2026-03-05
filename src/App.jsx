import { useEffect, useState } from 'react';
import './index.css';

function App() {
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // State cho chức năng Thêm / Sửa
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Tách hàm fetch để gọi lại sau khi Thêm/Sửa/Xóa
  const fetchProducts = () => {
    setIsLoading(true);
    fetch('/api/products')
      .then(response => {
        if (!response.ok) throw new Error('Không thể kết nối đến máy chủ');
        return response.json();
      })
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(error => {
        setErrorMsg(error.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Xử lý gửi Form (Thêm hoặc Sửa)
  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = { name, price: Number(price) };
    
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
    .then(response => {
      if (!response.ok) throw new Error('Thao tác thất bại');
      // Reset form
      setEditingId(null);
      setName('');
      setPrice('');
      // Tải lại dữ liệu
      fetchProducts();
    })
    .catch(error => setErrorMsg(error.message));
  };

  // Mồi dữ liệu lên Form để Sửa
  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
  };

  // Xử lý Xóa
  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      fetch(`/api/products/${id}`, { method: 'DELETE' })
        .then(response => {
          if (!response.ok) throw new Error('Xóa thất bại');
          fetchProducts();
        })
        .catch(error => setErrorMsg(error.message));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1 className="title">Quản lý sản phẩm</h1>
          <span className="badge">Công nghệ</span>
        </div>

        {errorMsg && (
          <div className="error-box">
            ⚠️ <strong>Lỗi:</strong> {errorMsg}
          </div>
        )}

        {/* Khu vực Form nhập liệu */}
        <div className="form-wrapper">
          <h3 className="form-title">{editingId ? '✏️ Cập nhật sản phẩm' : '➕ Thêm sản phẩm mới'}</h3>
          <form onSubmit={handleSubmit} className="form-inline">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Tên sản phẩm..." 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
            <input 
              type="number" 
              className="input-field input-price" 
              placeholder="Giá ($)..." 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              required 
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setName(''); setPrice(''); }}>
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="th">ID</th>
                <th className="th">Tên sản phẩm</th>
                <th className="th-right">Giá ($)</th>
                <th className="th-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="loading-cell">
                    <div className="spinner"></div>
                    <p style={{ marginTop: '10px', color: '#64748b' }}>Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map(product => (
                  <tr key={product.id} className="tr">
                    <td className="td-id">#{product.id}</td>
                    <td className="td-name">{product.name}</td>
                    <td className="td-price">${product.price.toLocaleString()}</td>
                    <td className="td-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(product)}>Sửa</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(product.id)}>Xóa</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;