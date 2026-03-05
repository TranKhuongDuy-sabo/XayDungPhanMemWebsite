import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Gọi API qua trạm trung chuyển để tránh lỗi bảo mật Vercel chặn Somee
    const apiUrl = 'https://api.allorigins.win/raw?url=http://trankhuongduy.somee.com/api/products';
    
    fetch(apiUrl) 
      .then(response => {
        if (!response.ok) {
          throw new Error('Mạng lỗi hoặc trạm trung chuyển từ chối');
        }
        return response.json();
      })
      .then(data => {
        console.log("Dữ liệu lấy về thành công: ", data); // In ra để xem thử
        setProducts(data);
      })
      .catch(error => {
        console.error('Lỗi chi tiết:', error);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', color: 'white' }}>
      <h1>Danh sách sản phẩm công nghệ</h1>
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
              <td colSpan="3" style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App