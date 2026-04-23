import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';
import axios from 'axios';
import { FiFilter, FiShoppingCart, FiTag, FiDollarSign } from 'react-icons/fi';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCategory = searchParams.get('category') || 'ALL';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState('ALL');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const getImageUrl = (imgName) => {
    if (!imgName) return "https://via.placeholder.com/300";
    if (imgName.startsWith('http')) return imgName;
    return `http://localhost:5164/uploads/${imgName}`;
  };

  const getCartKey = () => {
    const username = localStorage.getItem('username');
    return username ? `cart_${username}` : 'cart_guest';
  };

  // Thay thế toàn bộ hàm addToCart cũ thành hàm này
  const addToCart = (product) => {
    const username = localStorage.getItem('username');

    // 🔥 CHẶN NGAY TỪ CỬA: Nếu chưa đăng nhập thì báo lỗi và chuyển trang
    if (!username) {
      navigate('/login');
      return; // Lệnh return này cực kỳ quan trọng để ngắt không cho chạy code bên dưới
    }

    // Nếu đã đăng nhập thì xử lý bình thường
    const cartKey = `cart_${username}`;
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    // Tương thích cả Home (product.id) và Products (product.productId)
    const actualId = product.productId || product.id;
    const index = cart.findIndex(item => item.id === actualId);

    if (index > -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        id: actualId,
        name: product.productName || product.name,
        price: product.price,
        image: product.image || product.imageUrl,
        quantity: 1
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));

    showToast(`Đã thêm "${product.productName || product.name}" vào giỏ hàng!`, 'success');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resP, resC] = await Promise.all([
          axios.get("http://localhost:5164/api/products"),
          axios.get("http://localhost:5164/api/categories")
        ]);

        const activeProducts = resP.data.filter(p =>
          (p.isActive === true || p.isActive === "true") &&
          (p.categoryIsActive === true || p.categoryIsActive === "true")
        );

        const activeCategories = resC.data.filter(c =>
          c.isActive === true || c.isActive === "true" || c.isActive === "True"
        );

        setProducts(activeProducts);
        setCategories(activeCategories);
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 🔥 FIX 1: LOGIC LỌC DỰA THEO TÊN DANH MỤC TRẢ VỀ TỪ API ---
  const displayedProducts = products.filter(p => {
    // 1. Kiểm tra Danh mục
    let matchCategory = false;
    if (selectedCategory === 'ALL') {
      matchCategory = true;
    } else {
      // Tìm đối tượng danh mục đang được chọn
      const catObj = categories.find(c => String(c.id || c.categoryId) === String(selectedCategory));
      if (catObj) {
        // So sánh Tên danh mục của sản phẩm với Tên danh mục đang chọn
        const catName = catObj.name || catObj.categoryName;
        matchCategory = (p.categoryName === catName);
      }
    }

    // 2. Kiểm tra Giá
    let matchPrice = true;
    if (selectedPrice === 'UNDER_10') matchPrice = p.price < 10000000;
    else if (selectedPrice === '10_TO_20') matchPrice = p.price >= 10000000 && p.price <= 20000000;
    else if (selectedPrice === 'OVER_20') matchPrice = p.price > 20000000;

    return matchCategory && matchPrice;
  });

  const handleCategoryClick = (catId) => {
    if (catId === 'ALL') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">

      <div className="mb-8 border-b border-slate-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
            Kho Linh Kiện <span className="text-blue-600">SaboTech</span>
          </h1>
          <p className="text-slate-500 mt-2">Tìm thấy <span className="font-bold text-blue-600">{displayedProducts.length}</span> sản phẩm phù hợp</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* --- FIX 2: BỌC 2 CỘT LỌC VÀO CHUNG 1 KHUNG STICKY --- */}
        <div className="lg:w-64 flex-shrink-0">
          {/* Sticky bọc cả 2 khối để không bị đè lên nhau */}
          <div className="lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto custom-scrollbar lg:pr-2 lg:pb-4">

            {/* BỘ LỌC DANH MỤC */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-black text-slate-800 mb-4 uppercase tracking-widest text-sm flex items-center gap-2 border-b border-slate-100 pb-4">
                <FiTag className="text-blue-600" /> Danh Mục
              </h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
                <button
                  onClick={() => handleCategoryClick('ALL')}
                  className={`px-4 py-3 rounded-xl text-left font-bold transition-all whitespace-nowrap lg:whitespace-normal ${selectedCategory === 'ALL' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map(cat => {
                  const catIdStr = String(cat.id || cat.categoryId);
                  return (
                    <button
                      key={catIdStr}
                      onClick={() => handleCategoryClick(catIdStr)}
                      className={`px-4 py-3 rounded-xl text-left font-bold transition-all whitespace-nowrap lg:whitespace-normal ${selectedCategory === catIdStr ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {cat.name || cat.categoryName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BỘ LỌC GIÁ */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-black text-slate-800 mb-4 uppercase tracking-widest text-sm flex items-center gap-2 border-b border-slate-100 pb-4">
                <FiDollarSign className="text-blue-600" /> Mức Giá
              </h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
                <button
                  onClick={() => setSelectedPrice('ALL')}
                  className={`px-4 py-3 rounded-xl text-left font-bold transition-all whitespace-nowrap lg:whitespace-normal ${selectedPrice === 'ALL' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  Mọi mức giá
                </button>
                <button
                  onClick={() => setSelectedPrice('UNDER_10')}
                  className={`px-4 py-3 rounded-xl text-left font-bold transition-all whitespace-nowrap lg:whitespace-normal ${selectedPrice === 'UNDER_10' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  Dưới 10 triệu
                </button>
                <button
                  onClick={() => setSelectedPrice('10_TO_20')}
                  className={`px-4 py-3 rounded-xl text-left font-bold transition-all whitespace-nowrap lg:whitespace-normal ${selectedPrice === '10_TO_20' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  Từ 10 - 20 triệu
                </button>
                <button
                  onClick={() => setSelectedPrice('OVER_20')}
                  className={`px-4 py-3 rounded-xl text-left font-bold transition-all whitespace-nowrap lg:whitespace-normal ${selectedPrice === 'OVER_20' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  Trên 20 triệu
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* --- CỘT PHẢI: LƯỚI SẢN PHẨM --- */}
        <div className="flex-1">
          {displayedProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center">
              <FiFilter className="text-6xl text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
              <button onClick={() => { handleCategoryClick('ALL'); setSelectedPrice('ALL'); }} className="mt-4 text-blue-600 font-bold hover:underline">
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedProducts.map((product) => (
                <div 
                  key={product.productId || product.id} 
                  onClick={() => navigate(`/product/${product.productId || product.id}`)}
                  className="cursor-pointer bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-2xl transition-all group flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="relative aspect-square rounded-xl bg-slate-50 overflow-hidden mb-4 flex items-center justify-center p-4">
                    <img
                      src={getImageUrl(product.image || product.imageUrl)}
                      alt={product.productName || product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                      {product.brandName || product.brand?.brandName || "No Brand"}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 leading-tight h-10 overflow-hidden line-clamp-2">
                      {product.productName || product.name}
                    </h3>

                    <div className="flex items-end justify-between mt-auto pt-4">
                      <p className="text-xl font-black text-red-600 leading-none">
                        {new Intl.NumberFormat('vi-VN').format(product.price)}<span className="text-sm underline">đ</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Kho: {product.stock > 0 ? <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{product.stock}</span> : <span className="text-red-500">Hết</span>}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                      }}
                      disabled={product.stock <= 0}
                      className={`w-full mt-4 py-3.5 rounded-xl font-black transition-all active:scale-95 flex items-center justify-center gap-2
                                            ${product.stock > 0
                          ? "bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200/50"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                    >
                      <FiShoppingCart className="text-lg" /> {product.stock > 0 ? "THÊM VÀO GIỎ" : "LIÊN HỆ"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Products;