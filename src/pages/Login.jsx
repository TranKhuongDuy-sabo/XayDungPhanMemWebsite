import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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

        // 2. BẺ LÁI ĐIỀU HƯỚNG THEO ROLE
        if (data.role === 'Admin') {
          navigate('/admin', { state: { loginSuccess: true } });
        } else {
          navigate('/', { state: { loginSuccess: true } });
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
          <Link to="/" className="text-3xl font-black italic tracking-tighter text-amber-50">
            SABO<span className="text-blue-600">TECH</span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Kết nối với hệ sinh thái SaBoTech</p>
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

          <div className="relative">
            <label className="block text-sm font-bold text-slate-300 mb-2">Mật khẩu</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-12" // Thêm pr-12 để không bị chữ đè lên icon
                placeholder="••••••••"
                required
              />

              {/* Nút con mắt */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors p-2"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 8.049 7.21 5 12 5c4.789 0 8.601 3.049 9.964 6.678.045.166.045.337 0 .503C20.601 15.951 16.79 19 12 19c-4.79 0-8.601-3.049-9.964-6.678z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  // Icon Mắt gạch chéo
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
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