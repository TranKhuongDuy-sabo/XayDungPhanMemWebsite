import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. STATE QUẢN LÝ TÌM KIẾM
  const [searchTerm, setSearchTerm] = useState("");

  // 2. STATE QUẢN LÝ GIỎ HÀNG
  const [cartCount, setCartCount] = useState(0);

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  // --- 🔥 HÀM LẤY KEY GIỎ HÀNG RIÊNG BIỆT ---
  const getCartKey = () => {
    return username ? `cart_${username}` : 'cart_guest';
  };

  const updateCartBadge = () => {
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartCount(total);
  };

  useEffect(() => {
    updateCartBadge();
    window.addEventListener('storage', updateCartBadge);
    return () => window.removeEventListener('storage', updateCartBadge);
  }, [username]); // Khi username thay đổi (đăng nhập/out), cập nhật lại số badge

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? "text-blue-600 font-bold" : "text-slate-600 hover:text-blue-600 font-medium transition-colors";

  // --- 🔥 HÀM TÌM KIẾM ---
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm.trim()}`);
      // setSearchTerm(""); // Có thể xóa hoặc giữ lại tùy Duy
    }
  };

  // --- 🔥 HÀM ĐĂNG XUẤT (KHÔNG XÓA GIỎ HÀNG) ---
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      // Chỉ xóa thông tin đăng nhập, KHÔNG xóa giỏ hàng
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      
      setIsProfileOpen(false);
      navigate('/login');
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
        
        {/* LOGO */}
        <Link to="/" className="text-3xl font-black italic tracking-tighter text-slate-800">
          SABO<span className="text-blue-600">TECH</span>
        </Link>

        {/* THANH TÌM KIẾM - Đã thêm Logic */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm laptop, linh kiện PC..." 
            className="w-full border-2 border-blue-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 transition-all" 
          />
          <button type="submit" className="absolute right-0 top-0 h-full bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-r-md transition-colors">🔍</button>
        </form>

        {/* NAVIGATION & ACTION BUTTONS */}
        <nav className="flex items-center gap-6">
          <Link to="/" className={isActive('/')}>Trang chủ</Link>
          <Link to="/products" className={isActive('/products')}>Sản phẩm</Link>

          {/* NÚT GIỎ HÀNG */}
          <Link to="/cart" className="relative text-2xl cursor-pointer hover:scale-110 transition-transform">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white px-1 shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* KHU VỰC USER */}
          {username ? (
            <div className="relative border-l-2 border-slate-200 pl-4 ml-2">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                  {username[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline">Hi, <span className="font-bold">{username}</span></span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 py-2 z-50 animate-fadeIn">
                  {role === 'Admin' ? (
                    <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                      ⚙️ Trang Quản lý
                    </Link>
                  ) : (
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                      👤 Thông tin cá nhân
                    </Link>
                  )}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-colors">
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-md shadow-blue-500/30 active:scale-95 ml-2">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;