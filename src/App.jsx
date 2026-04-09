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
import ProductManager from './pages/ProductManager'; 
import CategoryManager from './pages/CategoryManager';
import BrandManager from './pages/BrandManager';
import Dashboard from './pages/Dashboard'; 

// 🔥 Bước 1: Import trang Cart Duy vừa tạo
import Cart from './pages/Cart'; 

function App() {
  return (
    <Router>
      <Routes>
        
        {/* ======================================= */}
        {/* NHÁNH 1: KHÁCH HÀNG (MAIN LAYOUT)       */}
        {/* ======================================= */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* 🔥 Bước 2: Thêm đường dẫn cho giỏ hàng */}
          <Route path="cart" element={<Cart />} />
        </Route>

        {/* ======================================= */}
        {/* NHÁNH 2: ADMIN (ADMIN LAYOUT)           */}
        {/* ======================================= */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="brands" element={<BrandManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="products" element={<ProductManager />} />
          </Route>

        </Route>

      </Routes>
    </Router>
  );
}

export default App;