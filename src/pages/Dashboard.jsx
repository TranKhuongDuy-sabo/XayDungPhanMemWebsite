import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
    // --- 1. CẤU HÌNH API ---
    const API_BASE_URL = 'http://localhost:5164/api';
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { 'Authorization': `Bearer ${token}` };
    };

    // --- 2. STATE DỮ LIỆU ---
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 3. FETCH DATA TỪ BACKEND ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/Dashboard/stats`, { 
                    headers: getAuthHeaders() 
                });
                setData(res.data);
            } catch (error) {
                console.error("Lỗi lấy thống kê:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-6 font-bold text-slate-500 animate-pulse">Đang tải dữ liệu SaboTech...</div>;
    if (!data) return <div className="p-6 text-red-500 font-bold">❌ Không thể kết nối với máy chủ thống kê.</div>;

    return (
        <div className="p-6 space-y-8 animate-fadeIn">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Trang Tổng Quan Thống Kê</h1>
                    <p className="text-slate-500 font-medium italic">Hệ thống quản trị SaboTech - Dữ liệu thực từ Database</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-600">Dữ liệu: Đã cập nhật</span>
                </div>
            </div>

            {/* --- 1. CÁC CARD THỐNG KÊ NHANH (SỬ DỤNG DỮ LIỆU THẬT) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Tổng doanh thu" 
                    value={`${new Intl.NumberFormat('vi-VN').format(data.totalRevenue)}đ`} 
                    trend="Thực tế" icon="💰" color="text-blue-600" bg="bg-blue-50" 
                />
                <StatCard 
                    title="Tổng đơn hàng" 
                    value={data.totalOrders} 
                    trend="Đã đặt" icon="📦" color="text-emerald-600" bg="bg-emerald-50" 
                />
                <StatCard 
                    title="Số khách hàng" 
                    value={data.totalUsers} 
                    trend="Thành viên" icon="👥" color="text-violet-600" bg="bg-violet-50" 
                />
                <StatCard 
                    title="Tổng sản phẩm" 
                    value={data.totalProducts} 
                    trend="Trong kho" icon="🛠️" color="text-red-600" bg="bg-red-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- 2. BIỂU ĐỒ DOANH THU THẬT --- */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-700 uppercase text-sm tracking-widest mb-8">Doanh thu 7 ngày gần nhất</h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueChart}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                                    formatter={(value) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
                                />
                                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- 3. ĐƠN HÀNG MỚI NHẤT TỪ DB --- */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-700 uppercase text-sm tracking-widest mb-6">Đơn hàng mới nhất</h3>
                    <div className="space-y-5">
                        {data.recentOrders.map((order, index) => (
                            <OrderItem 
                                key={index}
                                name={order.customerName} 
                                item={order.productName} 
                                price={`${new Intl.NumberFormat('vi-VN').format(order.price)}đ`} 
                                status={order.status} 
                            />
                        ))}
                        {data.recentOrders.length === 0 && <p className="text-slate-400 text-xs italic">Chưa có đơn hàng nào.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CÁC COMPONENT CON (GIỮ NGUYÊN GIAO DIỆN ĐẸP) ---
const StatCard = ({ title, value, trend, icon, color, bg }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:border-blue-300 transition-all cursor-default">
        <div className="flex items-start justify-between">
            <div className={`${bg} ${color} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-600 uppercase`}>
                {trend}
            </span>
        </div>
        <div className="mt-4">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h2 className="text-2xl font-black text-slate-800 mt-1">{value}</h2>
        </div>
    </div>
);

const OrderItem = ({ name, item, price, status }) => (
    <div className="flex items-center justify-between group hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors">
        <div>
            <p className="font-bold text-slate-800 text-sm">{name}</p>
            <p className="text-[11px] text-slate-400 font-medium">{item} • {price}</p>
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {status}
        </span>
    </div>
);

export default Dashboard;