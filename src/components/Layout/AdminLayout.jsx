import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    if (window.confirm('Đăng xuất khỏi trang quản trị?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  // Hàm check active cho Sidebar - Sửa lại để so khớp chính xác hơn
  const isActive = (path) => location.pathname === path
    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
    : "text-slate-400 hover:bg-slate-800 hover:text-white";

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* CỘT SIDEBAR TRÁI */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all">
        {/* Logo Admin */}
        <div className="h-20 flex items-center justify-center border-b border-slate-800">
          <Link to="/admin" className="text-2xl font-black italic tracking-tighter">
            SABO<span className="text-blue-500">ADMIN</span>
          </Link>
        </div>

        {/* Menu Điều hướng */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/admin" className={`block px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin')}`}>
            📊 Tổng quan
          </Link>

          <Link to="/admin/users" className={`block px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/users')}`}>
            👥 Quản lý Người dùng
          </Link>

          {/* SỬA LẠI MỤC DANH MỤC Ở ĐÂY 👇 */}
          <Link to="/admin/categories" className={`block px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/categories')}`}>
            📁 Quản lý Danh mục
          </Link>

          <Link to="/admin/brands" className={`block px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/brands')}`}>
            🏷️ Quản lý Thương hiệu
          </Link>

          <Link to="/admin/products" className={`block px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/products')}`}>
            💻 Quản lý Sản phẩm
          </Link>

          <div className="my-4 border-t border-slate-800"></div>

          <Link to="/" className="block px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-semibold">
            🌐 Về trang Cửa hàng
          </Link>
        </nav>

        {/* Nút Đăng xuất ở đáy */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full py-3 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* VÙNG NỘI DUNG CHÍNH (BÊN PHẢI) */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar của Admin */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Hệ thống Quản trị</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase">Admin Panel</p>
              <p className="text-sm font-medium text-slate-600">
                Chào, <span className="font-bold text-blue-600">{username || 'Admin'}</span>
              </p>
            </div>
            {/* Avatar chữ cái đầu */}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-blue-500">
              {username ? username[0].toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Vùng thay đổi nội dung (Outlet) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;