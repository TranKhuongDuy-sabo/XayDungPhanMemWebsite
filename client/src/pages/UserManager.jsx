import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast';
import { FiUsers, FiTrash2, FiShield, FiUser, FiAlertTriangle } from 'react-icons/fi';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5164/api/Accounts/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            showToast("Lỗi lấy danh sách tài khoản", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Hàm Đổi Quyền
    const handleToggleRole = async (id, currentRole, username) => {
        if (username.toLowerCase() === 'admin') {
            showToast("Không thể sửa Admin hệ thống!", "error");
            return;
        }
        try {
            const res = await axios.put(`http://localhost:5164/api/Accounts/toggle-role/${id}`);
            showToast(res.data.message, "success");
            fetchUsers(); // Load lại bảng
        } catch (error) {
            showToast(error.response?.data || "Lỗi thay đổi quyền", "error");
        }
    };

    // Hàm Xóa (Gọi khi bấm xác nhận trên Modal)
    const executeDelete = async () => {
        if (!userToDelete) return;
        try {
            await axios.delete(`http://localhost:5164/api/Accounts/${userToDelete.userId}`);
            showToast("Đã xóa tài khoản!", "success");
            setUserToDelete(null);
            fetchUsers();
        } catch (error) {
            showToast(error.response?.data || "Không thể xóa tài khoản này!", "error");
            setUserToDelete(null);
        }
    };

    if (loading) return <div className="p-10 font-black text-slate-400 animate-pulse text-center">Đang tải dữ liệu User...</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <FiUsers className="text-2xl" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Tài khoản</h1>
                    <p className="text-slate-500 font-medium">Cấp quyền và quản lý thành viên hệ thống</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="p-5">Thành viên</th>
                                <th className="p-5">Liên hệ</th>
                                <th className="p-5 text-center">Quyền hạn (Role)</th>
                                <th className="p-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((u) => {
                                const isSuperAdmin = u.username.toLowerCase() === 'admin';
                                
                                return (
                                    <tr key={u.userId} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="p-5 flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${u.role === 'Admin' ? 'bg-amber-500' : 'bg-slate-300'}`}>
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800 text-sm">{u.username}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {u.userId}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm font-medium text-slate-600">
                                            <div>{u.fullName || "Chưa cập nhật tên"}</div>
                                            <div className="text-xs text-slate-400">{u.email || "Chưa có email"}</div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${u.role === 'Admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {u.role === 'Admin' ? <FiShield/> : <FiUser/>} {u.role || 'User'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right space-x-2">
                                            {!isSuperAdmin ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleToggleRole(u.userId, u.role, u.username)} 
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.role === 'Admin' ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                                                    >
                                                        {u.role === 'Admin' ? 'Hạ quyền' : 'Duyệt Admin'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setUserToDelete(u)} 
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Xóa tài khoản"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-red-500 font-black uppercase bg-red-50 px-2 py-1 rounded border border-red-100">Bất khả xâm phạm</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🔥 MODAL XÓA */}
            {userToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><FiAlertTriangle className="text-3xl" /></div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Xóa tài khoản?</h3>
                        <p className="text-slate-500 mb-8 text-sm">Bạn sắp xóa vĩnh viễn user <strong className="text-red-500">{userToDelete.username}</strong>.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setUserToDelete(null)} className="flex-1 py-3.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 transition-colors">Hủy</button>
                            <button onClick={executeDelete} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all">Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;