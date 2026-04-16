import { useEffect, useState } from 'react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imgName) => {
    if (!imgName) return "https://via.placeholder.com/300";
    if (imgName.startsWith('http')) return imgName;
    return `http://localhost:5164/uploads/${imgName}`;
  };

  // --- 🔥 BƯỚC 1: THÊM HÀM ADD TO CART GIỐNG TRANG HOME ---
  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Tìm ID: Duy lưu ý API trả về 'id' hay 'productId' thì dùng cho đúng nhé
    const index = cart.findIndex(item => item.id === product.id);
    
    if (index > -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Bắn sự kiện để Header nhảy số badge đỏ
    window.dispatchEvent(new Event('storage'));
    
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  useEffect(() => {
    fetch("http://localhost:5164/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch products:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
            Kho Linh Kiện <span className="text-blue-600">SaboTech</span>
          </h1>
          <p className="text-slate-500 text-sm">Tìm thấy {products.length} sản phẩm phù hợp</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['Tất cả', 'Laptop - PC', 'Gaming', 'Linh Kiện', 'Phụ Kiện'].map(cat => (
            <button key={cat} className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap">
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-2xl transition-all group flex flex-col justify-between"
          >
            <div className="relative aspect-square rounded-xl bg-slate-50 overflow-hidden mb-4 flex items-center justify-center p-4">
              <img 
                src={getImageUrl(product.image)} 
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold">
                {product.brandName}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">
                {product.categoryName}
              </span>
              <h3 className="font-bold text-slate-800 leading-tight h-10 overflow-hidden line-clamp-2">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between mt-4">
                <p className="text-xl font-black text-red-600">
                  {product.price.toLocaleString()}đ
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Kho: {product.stock > 0 ? product.stock : <span className="text-red-500">Hết hàng</span>}
                </p>
              </div>

              <p className="text-[12px] text-slate-500 line-clamp-2 italic h-8">
                {product.description || "Đang cập nhật thông tin chi tiết..."}
              </p>

              {/* --- 🔥 BƯỚC 2: GẮN onClick VÀO ĐÂY --- */}
              <button 
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`w-full mt-4 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2
                  ${product.stock > 0 
                    ? "bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              >
                {product.stock > 0 ? "🛒 THÊM GIỎ HÀNG" : "LIÊN HỆ"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;