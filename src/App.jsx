import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import UserManager from './pages/UserManager';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route cha dùng MainLayout làm khung */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Các Route con nằm bên trong */}
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<UserManager />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;