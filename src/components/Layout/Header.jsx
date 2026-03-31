import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "text-blue-500 font-bold" : "text-slate-600 hover:text-blue-500";

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
        <Link to="/" className="text-2xl font-black italic tracking-tighter text-slate-800">
          SABO<span className="text-blue-600">TECH</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <input type="text" placeholder="Tìm laptop, màn hình..." className="w-full border-2 border-blue-600 rounded-lg px-4 py-2 outline-none" />
          <button className="absolute right-0 top-0 h-full bg-blue-600 text-white px-6 rounded-r-md">🔍</button>
        </div>

        <nav className="flex items-center gap-6">
          <Link to="/" className={isActive('/')}>Trang chủ</Link>
          <Link to="/products" className={isActive('/products')}>Sản phẩm</Link>
          <Link to="/users" className={isActive('/users')}>Quản lý User</Link>
          <div className="relative text-2xl cursor-pointer">🛒</div>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold">Login</button>
        </nav>
      </div>
    </header>
  );
};

export default Header; // Quan trọng: Phải export để file khác dùng được