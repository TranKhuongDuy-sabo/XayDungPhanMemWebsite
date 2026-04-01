import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Lưu ý: Thay domain bằng link Somee thực tế của bạn
      const response = await fetch('http://localhost:5164/api/Accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // 1. Lưu toàn bộ thông tin vào localStorage
        if (data.token) {
            localStorage.setItem('token', data.token); 
            localStorage.setItem('username', data.username); 
            localStorage.setItem('role', data.role); // Lưu Role (Ví dụ: "Admin" hoặc "User")
        }
        
        alert(`Đăng nhập thành công! Chào mừng ${data.username}`);
        
        // 2. BẺ LÁI ĐIỀU HƯỚNG THEO ROLE
        if (data.role === 'Admin') {
            navigate('/admin'); // Hoặc link /admin tùy bạn đặt
        } else {
            navigate('/'); // User thường về trang chủ
        }
      } else {
        setError('Sai tên đăng nhập hoặc mật khẩu!');
      }

    } catch (err) {
      setError('Lỗi kết nối đến Server! Kiểm tra lại mạng hoặc Backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center animate-fadeIn py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl shadow-blue-900/20 relative overflow-hidden">
        {/* Lớp màu xanh mờ tạo hiệu ứng glow ở góc */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full"></div>

        <div className="text-center relative z-10">
          <h2 className="text-3xl font-black text-white tracking-wider">ĐĂNG NHẬP</h2>
          <p className="text-slate-400 mt-2 text-sm">Kết nối lại với hệ sinh thái SaBoTech</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Tên đăng nhập</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Nhập username của bạn..."
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="••••••••"
              required 
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? 'ĐANG KẾT NỐI...' : 'ĐĂNG NHẬP NGAY'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm relative z-10 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-500 font-bold hover:text-blue-400 hover:underline transition-all">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;