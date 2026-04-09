import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layouts
import MainLayout from './components/Layout/MainLayout';
import AdminLayout from './components/Layout/AdminLayout'; 

// Import Lính gác
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import UserManager from './pages/UserManager';
// 1. IMPORT COMPONENT MỚI VÀO ĐÂY 👇
import ProductManager from './pages/ProductManager'; 

function App() {
  return (
    <Router>
      <Routes>
        
        {/* ======================================= */}
        {/* NHÁNH 1: DÀNH CHO KHÁCH HÀNG (MAIN LAYOUT) */}
        {/* ======================================= */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* ======================================= */}
        {/* NHÁNH 2: DÀNH CHO ADMIN (ADMIN LAYOUT)    */}
        {/* ======================================= */}
        {/* BƯỚC SỬA LỖI Ở ĐÂY: Cho lính gác bọc toàn bộ nhánh /admin */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          
          <Route path="/admin" element={<AdminLayout />}>
            {/* Trang mặc định khi gõ /admin */}
            <Route index element={<h1 className="text-2xl font-bold text-slate-800">Trang Tổng quan Thống kê</h1>} />
            
            {/* Các trang quản lý */}
            <Route path="users" element={<UserManager />} />
            
            {/* 2. RÁP COMPONENT VÀO ĐÂY 👇 (Đã xóa thẻ <h1> cũ) */}
            <Route path="products" element={<ProductManager />} />
            
          </Route>

        </Route>

      </Routes>
    </Router>
  );
}

export default App;