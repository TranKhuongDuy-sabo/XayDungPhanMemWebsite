import { useEffect, useState } from 'react';

// 1. Phải có từ khóa 'const' hoặc 'function' để định nghĩa tên UserManager
const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');

  // Hàm lấy danh sách user từ Backend ASP.NET của bạn
  const fetchUsers = () => {
    fetch("http://localhost:5164/api/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Lỗi kết nối API:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("https://localhost:5164/api/users", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(() => {
      setName('');
      fetchUsers();
    });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 italic">Quản lý người dùng (Nộp bài)</h1>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Admin Panel</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input 
          type="text" 
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
          placeholder="Nhập tên User mới..." 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          Thêm mới
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Họ và Tên</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length > 0 ? users.map(u => (
              <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 font-mono text-blue-600">#{u.id}</td>
                <td className="px-6 py-4 font-medium text-gray-700">{u.name}</td>
                <td className="px-6 py-4 text-center text-green-500 font-bold">● Active</td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">Chưa có dữ liệu từ Database Somee...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 2. PHẢI CÓ DÒNG NÀY Ở CUỐI: Xuất khẩu đúng cái tên UserManager
export default UserManager;