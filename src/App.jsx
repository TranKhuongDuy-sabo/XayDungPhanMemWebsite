import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Gọi API qua trạm trung chuyển
    const apiUrl = 'https://api.allorigins.win/raw?url=http://trankhuongduy.somee.com/api/products';
    
    fetch(apiUrl) 
      .then(response => {
        if (!response.ok) {
          throw new Error('Mạng lỗi hoặc trạm trung chuyển từ chối');
        }
        return response.text(); // Lấy về dạng Text thô, KHÔNG dùng .json() ngay
      })
      .then(textData => {
        console.log("Dữ liệu thô tải về:", textData); // In ra để xem Somee chèn gì vào
        
        // Cắt lấy đúng phần JSON (từ dấu [ đầu tiên đến dấu ] cuối cùng)
        const startIndex = textData.indexOf('[');
        const endIndex = textData.lastIndexOf(']');
        
        if (startIndex !== -1 && endIndex !== -1) {
            const cleanJsonString = textData.substring(startIndex, endIndex + 1);
            const data = JSON.parse(cleanJsonString); // Ép kiểu an toàn
            console.log("Dữ liệu sạch:", data);
            setProducts(data);
        } else {
            throw new Error('Không tìm thấy dữ liệu JSON hợp lệ');
        }
      })
      .catch(error => {
        console.error('Lỗi chi tiết:', error);
        setErrorMsg('Lỗi: ' + error.message); // Hiển thị lỗi lên màn hình để dễ bắt bệnh
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', color: 'white' }}>
      <h1>Danh sách sản phẩm công nghệ</h1>
      
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

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
                {!errorMsg && "Đang tải dữ liệu..."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App