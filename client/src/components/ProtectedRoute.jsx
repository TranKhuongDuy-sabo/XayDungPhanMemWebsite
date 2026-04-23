import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 1. Nếu không có token (chưa đăng nhập) -> Đá về trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu có mảng quy định Role, mà Role của user không nằm trong đó -> Đá về Trang chủ
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Nếu hợp lệ hết -> Cho phép đi tiếp vào component con (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;