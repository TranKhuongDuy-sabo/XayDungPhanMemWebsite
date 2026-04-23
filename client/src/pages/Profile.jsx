import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';
import { FiUser, FiLock, FiSave, FiEdit3, FiPhone, FiMail, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('info'); 
    const [loading, setLoading] = useState(false);
    
    const [profile, setProfile] = useState({ fullName: '', phone: '', email: '', address: '' });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    
    // 🔥 BA STATE ĐIỀU KHIỂN 3 CON MẮT
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        fetchProfileInfo();
    }, []);

    const fetchProfileInfo = async () => {
        try {
            const res = await axios.get(`http://localhost:5164/api/Accounts/profile/${username}`);
            setProfile({
                fullName: res.data.fullName || '',
                phone: res.data.phone || '',
                email: res.data.email || '',
                address: res.data.address || ''
            });
        } catch (error) {
            console.error("Lỗi lấy thông tin:", error);
        }
    };

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://localhost:5164/api/Accounts/profile/${username}`, profile);
            showToast("Cập nhật thông tin thành công!", "success");
        } catch (error) {
            // 🔥 Bắt lỗi chi tiết từ server
            showToast(error.response?.data || "Lỗi cập nhật thông tin!", "error");
        } finally { setLoading(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return showToast("Mật khẩu xác nhận không khớp!", "error");
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:5164/api/Accounts/change-password', {
                username: username,
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            showToast("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
            
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            showToast(error.response?.data || "Mật khẩu cũ không đúng!", "error");
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-fadeIn min-h-screen">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-3">
                <FiUser className="text-blue-600" /> Tài khoản của tôi
            </h1>
            
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row overflow-hidden">
                {/* MENU TRÁI */}
                <div className="w-full md:w-72 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30">
                            {username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-black text-slate-800 truncate">{username}</p>
                            <p className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-widest inline-block mt-1">
                                {localStorage.getItem('role') || 'User'}
                            </p>
                        </div>
                    </div>
                    <div className="flex md:flex-col gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                        <button onClick={() => setActiveTab('info')} className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'info' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
                            <FiEdit3 className="text-lg" /> Thông tin hồ sơ
                        </button>
                        <button onClick={() => setActiveTab('password')} className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'password' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
                            <FiLock className="text-lg" /> Đổi mật khẩu
                        </button>
                    </div>
                </div>

                {/* NỘI DUNG PHẢI */}
                <div className="flex-1 p-6 md:p-10">
                    {activeTab === 'info' ? (
                        <div className="animate-slideUp">
                            <h2 className="text-xl font-black text-slate-800 mb-6">Chi tiết hồ sơ</h2>
                            <form onSubmit={handleUpdateInfo} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><FiUser/> Họ và tên</label>
                                        <input type="text" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold transition-all" placeholder="Nhập họ tên..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><FiPhone/> Số điện thoại</label>
                                        <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold transition-all" placeholder="Nhập SĐT..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><FiMail/> Email liên hệ</label>
                                    <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold transition-all" placeholder="Email..." />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><FiMapPin/> Địa chỉ nhận hàng</label>
                                    <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold transition-all" placeholder="Nhập địa chỉ chi tiết..." />
                                </div>
                                <button type="submit" disabled={loading} className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 mt-6">
                                    <FiSave className="text-lg" /> LƯU THAY ĐỔI
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="animate-slideUp max-w-md">
                            <h2 className="text-xl font-black text-slate-800 mb-6">Bảo mật tài khoản</h2>
                            <form onSubmit={handleChangePassword} className="space-y-5">
                                
                                {/* Ô MẬT KHẨU CŨ */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Mật khẩu hiện tại</label>
                                    <div className="relative">
                                        <input type={showOldPassword ? "text" : "password"} required value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold transition-all" />
                                        <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                            {showOldPassword ? <FiEye className="text-lg"/> : <FiEyeOff className="text-lg"/>}
                                        </button>
                                    </div>
                                </div>

                                {/* Ô MẬT KHẨU MỚI */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Mật khẩu mới</label>
                                    <div className="relative">
                                        <input type={showNewPassword ? "text" : "password"} required value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold transition-all" />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                            {showNewPassword ? <FiEye className="text-lg"/> : <FiEyeOff className="text-lg"/>}
                                        </button>
                                    </div>
                                </div>

                                {/* Ô XÁC NHẬN MẬT KHẨU MỚI */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Xác nhận mật khẩu mới</label>
                                    <div className="relative">
                                        <input type={showConfirmPassword ? "text" : "password"} required value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold transition-all" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                            {showConfirmPassword ? <FiEye className="text-lg"/> : <FiEyeOff className="text-lg"/>}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black hover:bg-blue-600 shadow-lg transition-all active:scale-95 mt-6">
                                    <FiLock className="text-lg" /> CẬP NHẬT MẬT KHẨU
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;