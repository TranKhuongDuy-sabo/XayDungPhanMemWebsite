import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Toast from './components/Toast';

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
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import OrderManager from './pages/OrderManager';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart'; 
import ProductDetail from './pages/ProductDetail';
import ReviewManager from './pages/ReviewManager';

function App() {
  return (
    <Router>
      <Toast />
      <Routes>
        
        {/* ======================================= */}
        {/* NHÁNH 1: KHÁCH HÀNG (MAIN LAYOUT)       */}
        {/* ======================================= */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cart" element={<Cart />} />
          <Route path="profile" element={<Profile/>}/>
          <Route path="myorders" element={<MyOrders/>}/>
          <Route path="checkout" element={<Checkout />} />
          <Route path="product/:id" element={<ProductDetail />} />
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
            <Route path="order" element={<OrderManager />} />
            <Route path="reviews" element={<ReviewManager />} />
          </Route>

        </Route>

      </Routes>
    </Router>
  );
}

export default App;