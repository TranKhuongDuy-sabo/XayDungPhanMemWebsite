import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/products') 
      .then(response => {
        if (!response.ok) throw new Error('Không thể tải dữ liệu');
        return response.json();
      })
      .then(data => setProducts(data))
      .catch(error => setErrorMsg(error.message));
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Tech Store Modern</h1>
        <p>Sản phẩm công nghệ đỉnh cao</p>
      </header>

      {errorMsg && <div className="error-alert">Lỗi: {errorMsg}</div>}

      <div className="product-grid">
        {products.length > 0 ? (
          products.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image">💻</div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price">${product.price.toLocaleString()}</p>
                <button className="buy-btn">Mua ngay</button>
              </div>
            </div>
          ))
        ) : (
          <div className="loading">
             {!errorMsg ? "Đang tải sản phẩm..." : "Tải dữ liệu thất bại"}
          </div>
        )}
      </div>

      <style>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7f6;
          min-height: 100vh;
        }
        header {
          text-align: center;
          margin-bottom: 40px;
          color: #333;
        }
        .product-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }
        .product-card {
          background: white;
          border-radius: 12px;
          width: 250px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        .product-card:hover {
          transform: translateY(-5px);
        }
        .product-image {
          height: 150px;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 50px;
        }
        .product-info {
          padding: 15px;
          text-align: center;
        }
        .product-info h3 {
          margin: 10px 0;
          font-size: 1.1rem;
          color: #2d3436;
        }
        .price {
          font-weight: bold;
          color: #e67e22;
          font-size: 1.2rem;
          margin-bottom: 15px;
        }
        .buy-btn {
          background-color: #0984e3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          width: 100%;
          font-weight: bold;
          transition: background 0.3s;
        }
        .buy-btn:hover {
          background-color: #74b9ff;
        }
        .error-alert {
          background: #ff7675;
          color: white;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
        }
        .loading {
          font-size: 1.2rem;
          color: #636e72;
        }
      `}</style>
    </div>
  )
}

export default App