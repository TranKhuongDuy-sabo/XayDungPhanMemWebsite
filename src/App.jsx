import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Vercel sẽ tự động đọc file vercel.json và chuyển hướng ngầm link này sang Somee
    fetch('/api/products') 
      .then(response => {
        if (!response.ok) throw new Error('Không thể kết nối đến máy chủ');
        return response.json();
      })
      .then(data => {
        setProducts(data);
      })
      .catch(error => {
        setErrorMsg(error.message);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', color: 'white' }}>
      <h1>Danh sách sản phẩm công nghệ</h1>
      {errorMsg && <p style={{ color: 'red' }}>Lỗi: {errorMsg}</p>}
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '600px', color: 'black', backgroundColor: 'white' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>ID</th>
            <th>Tên sản phẩm</th>
            <th>Giá ($)</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(product => (
              <tr key={product.id}>
                <td style={{ textAlign: 'center' }}>{product.id}</td>
                <td>{product.name}</td>
                <td style={{ textAlign: 'center' }}>{product.price}</td>
              </tr>
            ))
          ) : (
             <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>
                {errorMsg ? "Tải dữ liệu thất bại" : "Đang tải dữ liệu..."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App