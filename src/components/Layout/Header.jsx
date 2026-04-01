import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State quản lý việc mở/đóng Dropdown Menu của User
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const isActive = (path) => location.pathname === path ? "text-blue-600 font-bold" : "text-slate-600 hover:text-blue-600 font-medium transition-colors";

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      localStorage.clear();
      setIsProfileOpen(false); // Đóng menu lại
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

        {/* THANH TÌM KIẾM */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <input type="text" placeholder="Tìm laptop, linh kiện PC..." className="w-full border-2 border-blue-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
          <button className="absolute right-0 top-0 h-full bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-r-md transition-colors">🔍</button>
        </div>

        {/* NAVIGATION & ACTION BUTTONS */}
        <nav className="flex items-center gap-6">
          <Link to="/" className={isActive('/')}>Trang chủ</Link>
          <Link to="/products" className={isActive('/products')}>Sản phẩm</Link>

          {/* NÚT GIỎ HÀNG */}
          <Link to="/cart" className="relative text-2xl cursor-pointer hover:scale-110 transition-transform">
            🛒
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              3
            </span>
          </Link>

          {/* ========================================== */}
          {/* KHU VỰC USER / WELCOME DROPDOWN            */}
          {/* ========================================== */}
          {username ? (
            <div className="relative border-l-2 border-slate-200 pl-4 ml-2">
              
              {/* Nút bấm để xổ menu ra */}
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors focus:outline-none"
              >
                {/* Avatar tròn nhỏ xíu */}
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                  {username[0].toUpperCase()}
                </div>
                <span>Hi, <span className="font-bold">{username}</span></span>
                {/* Mũi tên chỉ xuống (sẽ xoay lên khi click) */}
                <svg className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {/* Bảng Dropdown xổ xuống */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 py-2 z-50 animate-fadeIn">
                  
                  {/* Điều kiện: Nếu là Admin thì hiện Trang quản lý, ngược lại hiện Thông tin */}
                  {role === 'Admin' ? (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                    >
                      ⚙️ Trang Quản lý
                    </Link>
                  ) : (
                    <Link 
                      to="/profile" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                    >
                      👤 Thông tin cá nhân
                    </Link>
                  )}
                  
                  {/* Đường kẻ ngang ngăn cách */}
                  <div className="border-t border-slate-100 my-1"></div>
                  
                  {/* Nút Đăng xuất */}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-colors"
                  >
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