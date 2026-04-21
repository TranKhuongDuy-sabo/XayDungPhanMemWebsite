import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Import thư viện Icon (Feather Icons - tối giản, hiện đại)
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiChevronDown, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5164/api';

  // --- STATE QUẢN LÝ ---
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Modal thay thế window.confirm

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  // --- LOGIC GIỎ HÀNG ---
  const getCartKey = () => username ? `cart_${username}` : 'cart_guest';

  const updateCartBadge = () => {
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartCount(total);
  };

  // --- FETCH DỮ LIỆU ---
  useEffect(() => {
    updateCartBadge();
    window.addEventListener('storage', updateCartBadge);

    // Lấy danh mục từ API cho Menu Sản phẩm
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/Categories`);

        const activeCats = res.data.filter(cat =>
          cat.isActive === true || cat.isActive === "true" || cat.isActive === "True" || cat.IsActive === true
        );

        setCategories(activeCats); // Chỉ lưu những danh mục đang bật
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchCategories();

    return () => window.removeEventListener('storage', updateCartBadge);
  }, [username]);

  // --- UI HELPERS ---
  const isActive = (path) => location.pathname === path
    ? "text-blue-600 font-bold"
    : "text-slate-600 hover:text-blue-600 font-medium transition-colors duration-300";

  // --- ACTIONS ---
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm.trim()}`);
      setIsMobileMenuOpen(false); // Đóng menu mobile khi tìm kiếm
    }
  };

  const executeLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setShowLogoutModal(false);
    setIsProfileOpen(false);
    navigate('/login');
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 sticky top-0 z-40 transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4 md:gap-8">

          {/* NÚT MENU MOBILE */}
          <button
            className="md:hidden text-slate-800 text-2xl p-2 hover:bg-slate-100 rounded-lg transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>

          {/* LOGO */}
          <Link to="/" className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-800 hover:scale-105 transition-transform duration-300">
            SABO<span className="text-blue-600">TECH</span>
          </Link>

          {/* THANH TÌM KIẾM (DESKTOP) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm laptop, linh kiện PC..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-2.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors duration-300">
              <FiSearch className="text-xl" />
            </button>
          </form>

          {/* NAVIGATION (DESKTOP) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={isActive('/')}>Trang chủ</Link>

            {/* DROPDOWN SẢN PHẨM */}
            <div className="relative group py-8">
              <Link to="/products" className={`flex items-center gap-1 ${isActive('/products')}`}>
                Sản phẩm <FiChevronDown className="group-hover:rotate-180 transition-transform duration-300" />
              </Link>
              {/* Menu con xổ xuống */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <Link to="/products" className="block px-5 py-3 text-sm font-bold text-blue-600 bg-blue-50/50 border-b border-slate-50">
                  Tất Cả Sản Phẩm
                </Link>
                {categories.map(cat => (
                  <Link
                    key={cat.categoryId || cat.id}
                    to={`/products?category=${cat.categoryId || cat.id}`}
                    className="block px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    {cat.categoryName || cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/contact" className={isActive('/contact')}>Liên hệ</Link>
          </nav>

          {/* ICON ACTION & USER */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* GIỎ HÀNG */}
            <Link to="/cart" className="relative p-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 group">
              <FiShoppingCart className="text-2xl group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce-slow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* KHU VỰC USER */}
            {username ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 md:pl-4 md:border-l border-slate-200 focus:outline-none group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-blue-500/30 transition-all duration-300">
                    {username[0].toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role}</span>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{username}</span>
                  </div>
                </button>

                {/* USER DROPDOWN */}
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50 animate-fadeIn origin-top-right">
                      {role === 'Admin' ? (
                        <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                          <FiSettings className="text-lg" /> Trang Quản lý
                        </Link>
                      ) : (
                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                          <FiUser className="text-lg" /> Thông tin cá nhân
                        </Link>
                      )}
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setShowLogoutModal(true); // Bật Modal thay vì dùng window.confirm
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-colors"
                      >
                        <FiLogOut className="text-lg" /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-600/30 active:scale-95">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* --- MOBILE MENU OVERYLAY --- */}
        <div className={`md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] py-4' : 'max-h-0'}`}>
          <div className="px-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <FiSearch className="text-xl" />
              </button>
            </form>
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-slate-700 font-bold hover:bg-slate-50 rounded-xl">Trang chủ</Link>

              <div className="p-3 bg-slate-50 rounded-xl">
                <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-slate-800 block mb-2">Sản phẩm</Link>
                <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                  {categories.map(cat => (
                    <Link
                      key={cat.categoryId || cat.id}
                      to={`/products?category=${cat.categoryId || cat.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-sm text-slate-600 py-1"
                    >
                      {cat.categoryName || cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-slate-700 font-bold hover:bg-slate-50 rounded-xl">Liên hệ</Link>

              {!username && (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-center bg-blue-600 text-white font-bold rounded-xl mt-2">
                  Đăng nhập / Đăng ký
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- 🔥 MODAL ĐĂNG XUẤT (IN-APP NOTIFICATION) --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiLogOut className="text-3xl ml-1" />
            </div>
            <h3 className="text-2xl font-black text-center text-slate-800 mb-2">Đăng xuất?</h3>
            <p className="text-center text-slate-500 mb-8">Bạn có chắc chắn muốn rời khỏi hệ thống SaboTech không?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={executeLogout}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;