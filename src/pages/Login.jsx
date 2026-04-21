import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast'; 
import { FiMail, FiLock, FiShield, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  // --- STATES CHO ĐĂNG NHẬP ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- STATES CHO QUÊN MẬT KHẨU ---
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'verify' | 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --- STATES CHUNG ---
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setError(''); // Xóa lỗi cũ khi chuyển form
  }, [mode]);

  // ==================== CÁC HÀM XỬ LÝ ====================

  // 1. Hàm Đăng Nhập 
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5164/api/Accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          localStorage.setItem('role', data.role);
        }

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

  // 2. Hàm Gửi Email lấy mã Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5164/api/Accounts/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        showToast("Mã xác nhận đã gửi! Vui lòng kiểm tra email.", "success");
        setMode('verify');
      } else {
        const errText = await response.text();
        setError(errText || 'Email không tồn tại trong hệ thống!');
      }
    } catch (err) {
      setError('Lỗi kết nối đến Server!');
    } finally { setIsLoading(false); }
  };

  // 3. Hàm Xác nhận mã Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5164/api/Accounts/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (response.ok) {
        showToast("Mã chính xác! Vui lòng nhập mật khẩu mới.", "success");
        setMode('reset');
      } else {
        setError('Mã xác nhận sai hoặc đã hết hạn!');
      }
    } catch (err) {
      setError('Lỗi kết nối đến Server!');
    } finally { setIsLoading(false); }
  };

  // 4. Hàm Đặt Mật Khẩu Mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5164/api/Accounts/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      if (response.ok) {
        showToast("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
        setMode('login');
        setPassword(''); // Reset field
      } else {
        setError('Đã có lỗi xảy ra khi cập nhật mật khẩu.');
      }
    } catch (err) {
      setError('Lỗi kết nối đến Server!');
    } finally { setIsLoading(false); }
  };


  // ==================== GIAO DIỆN ====================
  return (
    <div className="min-h-[75vh] flex items-center justify-center animate-fadeIn py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl shadow-blue-900/20 relative overflow-hidden">
        {/* Lớp màu xanh mờ tạo hiệu ứng glow ở góc */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full"></div>

        <div className="text-center relative z-10">
          <Link to="/" className="text-3xl font-black italic tracking-tighter text-amber-50">
            SABO<span className="text-blue-600">TECH</span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">
            {mode === 'login' && 'Kết nối với hệ sinh thái SaboTech'}
            {mode === 'forgot' && 'Khôi phục tài khoản của bạn'}
            {mode === 'verify' && 'Xác thực bảo mật'}
            {mode === 'reset' && 'Thiết lập mật khẩu an toàn'}
          </p>
        </div>

        {/* --- KHU VỰC HIỂN THỊ LỖI --- */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-2 relative z-10 font-medium">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ========================================= */}
        {/* FORM 1: ĐĂNG NHẬP */}
        {/* ========================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Tên đăng nhập</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Nhập username của bạn..." required />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-300">Mật khẩu</label>
                {/* 🔥 NÚT QUÊN MẬT KHẨU NẰM Ở ĐÂY */}
                <button type="button" onClick={() => setMode('forgot')} className="text-xs text-blue-500 hover:text-blue-400 hover:underline font-bold transition-colors">
                  Quên mật khẩu?
                </button>
              </div>

              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors p-2">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 8.049 7.21 5 12 5c4.789 0 8.601 3.049 9.964 6.678.045.166.045.337 0 .503C20.601 15.951 16.79 19 12 19c-4.79 0-8.601-3.049-9.964-6.678z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70">
              {isLoading ? 'ĐANG KẾT NỐI...' : 'ĐĂNG NHẬP NGAY'}
            </button>
          </form>
        )}

        {/* ========================================= */}
        {/* FORM 2: NHẬP EMAIL ĐỂ LẤY MÃ */}
        {/* ========================================= */}
        {mode === 'forgot' && (
          <form onSubmit={handleRequestCode} className="space-y-5 relative z-10 animate-slideUp">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Email đăng ký tài khoản</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="VD: duy@gmail.com" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70">
              {isLoading ? 'ĐANG GỬI MÃ...' : 'GỬI MÃ KHÔI PHỤC'}
            </button>
            <button type="button" onClick={() => setMode('login')} className="w-full py-3 text-slate-400 hover:text-white text-sm font-bold transition-colors">
              Quay lại Đăng nhập
            </button>
          </form>
        )}

        {/* ========================================= */}
        {/* FORM 3: NHẬP MÃ XÁC NHẬN */}
        {/* ========================================= */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-5 relative z-10 animate-slideUp">
            <p className="text-sm text-slate-300 text-center">Chúng tôi đã gửi mã 6 số đến email <br/><strong className="text-blue-500">{email}</strong></p>
            <div>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-4 py-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-center text-xl font-black tracking-[1em]" placeholder="------" required maxLength={6} />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-70">
              {isLoading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN MÃ'}
            </button>
          </form>
        )}

        {/* ========================================= */}
        {/* FORM 4: ĐẶT MẬT KHẨU MỚI */}
        {/* ========================================= */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5 relative z-10 animate-slideUp">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-12" placeholder="Nhập mật khẩu mới..." required minLength={6}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors p-2">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 8.049 7.21 5 12 5c4.789 0 8.601 3.049 9.964 6.678.045.166.045.337 0 .503C20.601 15.951 16.79 19 12 19c-4.79 0-8.601-3.049-9.964-6.678z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70">
              {isLoading ? 'ĐANG LƯU...' : 'ĐỔI MẬT KHẨU'}
            </button>
          </form>
        )}

        {/* --- LINK ĐĂNG KÝ (Chỉ hiện khi ở form Login) --- */}
        {mode === 'login' && (
          <p className="text-center text-slate-400 text-sm relative z-10 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-500 font-bold hover:text-blue-400 hover:underline transition-all">
              Đăng ký ngay
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;