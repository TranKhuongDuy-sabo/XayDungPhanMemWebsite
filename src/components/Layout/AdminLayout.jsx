import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { showToast } from '../Toast';
// Import bộ icon chuyên nghiệp
import { FiPieChart, FiUsers, FiFolder, FiTag, FiMonitor, FiGlobe, FiLogOut, FiShoppingBag, FiMessageSquare } from 'react-icons/fi';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username');

  // --- STATE QUẢN LÝ MODAL ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (location.state?.loginSuccess) {
      showToast(`Đăng nhập thành công! Chào mừng Admin ${username}`, 'success');
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, username]);

  // --- HÀM ĐĂNG XUẤT THẬT ---
  const executeLogout = () => {
    // Chỉ xóa thông tin user, KHÔNG dùng clear() để bảo toàn giỏ hàng
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    setShowLogoutModal(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path
    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
    : "text-slate-400 hover:bg-slate-800 hover:text-white";

  return (
    <>
      <div className="flex h-screen bg-slate-100 overflow-hidden">

        {/* --- CỘT SIDEBAR TRÁI --- */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all border-r border-slate-800">

          {/* Logo Admin */}
          <div className="h-20 flex items-center justify-center border-b border-slate-800">
            <Link to="/admin" className="text-2xl font-black italic tracking-tighter hover:scale-105 transition-transform">
              SABO<span className="text-blue-500">ADMIN</span>
            </Link>
          </div>

          {/* Menu Điều hướng (Đã thay toàn bộ Icon) */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin')}`}>
              <FiPieChart className="text-lg" /> Tổng quan
            </Link>

            <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/users')}`}>
              <FiUsers className="text-lg" /> Quản lý Người dùng
            </Link>

            <Link to="/admin/categories" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/categories')}`}>
              <FiFolder className="text-lg" /> Quản lý Danh mục
            </Link>

            <Link to="/admin/brands" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/brands')}`}>
              <FiTag className="text-lg" /> Quản lý Thương hiệu
            </Link>

            <Link to="/admin/order" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/order')}`}>
              <FiShoppingBag className="text-lg" /> Quản lý Đơn hàng
            </Link>

            <Link to="/admin/reviews" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/reviews')}`}>
              <FiMessageSquare className="text-lg" /> Quản lý Đánh giá
            </Link>

            <Link to="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/admin/products')}`}>
              <FiMonitor className="text-lg" /> Quản lý Sản phẩm
            </Link>

            <div className="my-4 border-t border-slate-800"></div>

            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-semibold">
              <FiGlobe className="text-lg" /> Về trang Cửa hàng
            </Link>
          </nav>

          {/* Nút Đăng xuất ở đáy (Mở Modal) */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => setShowLogoutModal(true)} // 🔥 Bật Modal thay vì confirm
              className="w-full py-3 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold"
            >
              <FiLogOut className="text-lg" /> Đăng xuất
            </button>
          </div>
        </aside>

        {/* --- VÙNG NỘI DUNG CHÍNH (BÊN PHẢI) --- */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Topbar của Admin */}
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Hệ thống Quản trị</h2>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin Panel</p>
                <p className="text-sm font-medium text-slate-600">
                  Chào, <span className="font-bold text-blue-600">{username || 'Admin'}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black border-2 border-blue-100 shadow-sm">
                {username ? username[0].toUpperCase() : 'A'}
              </div>
            </div>
          </header>

          {/* Vùng thay đổi nội dung (Outlet) */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 md:p-8">
            <Outlet />
          </main>
        </div>

      </div>

      {/* --- 🔥 MODAL ĐĂNG XUẤT XỊN XÒ --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiLogOut className="text-3xl ml-1" />
            </div>
            <h3 className="text-2xl font-black text-center text-slate-800 mb-2">Đăng xuất?</h3>
            <p className="text-center text-slate-500 mb-8 text-sm">Bạn có chắc chắn muốn đóng phiên làm việc quản trị không?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95"
              >
                Hủy
              </button>
              <button
                onClick={executeLogout}
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 active:scale-95"
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

export default AdminLayout;