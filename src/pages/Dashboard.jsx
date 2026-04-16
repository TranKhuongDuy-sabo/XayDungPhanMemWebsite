import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const API_BASE_URL = 'http://localhost:5164/api';
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        chartData: [],
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // 1. Gọi đồng thời tất cả API Duy đã có
                const [resOrders, resProducts, resUsers] = await Promise.all([
                    axios.get(`${API_BASE_URL}/Orders`, { headers }),
                    axios.get(`${API_BASE_URL}/Products`),
                    axios.get(`${API_BASE_URL}/Accounts/users`, { headers }).catch(() => ({ data: [] })) 
                ]);

                const orders = resOrders.data || [];
                const products = resProducts.data || [];
                const users = resUsers.data || [];

                // 2. TÍNH TOÁN THỐNG KÊ TỪ DỮ LIỆU THẬT
                const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                
                // 3. XỬ LÝ DỮ LIỆU BIỂU ĐỒ (7 ngày gần nhất)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                }).reverse();

                const chartData = last7Days.map(dateStr => {
                    const totalInDay = orders
                        .filter(o => new Date(o.orderDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) === dateStr)
                        .reduce((sum, o) => sum + o.totalAmount, 0);
                    return { name: dateStr, total: totalInDay };
                });

                setStats({
                    totalRevenue: revenue,
                    totalOrders: orders.length,
                    totalProducts: products.length,
                    totalUsers: users.length,
                    chartData: chartData,
                    recentOrders: orders.slice(0, 5) // Lấy 5 đơn mới nhất
                });

            } catch (error) {
                console.error("Lỗi xử lý dữ liệu Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) return <div className="p-10 font-black text-slate-400 animate-pulse uppercase tracking-widest">SaboTech đang tổng hợp dữ liệu...</div>;

    return (
        <div className="p-6 space-y-8 animate-fadeIn bg-slate-50 min-h-screen">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">SaboAdmin Dashboard</h1>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-200">
                    DỮ LIỆU THỰC TẾ
                </div>
            </div>

            {/* --- CÁC CARD THỐNG KÊ --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Tổng doanh thu" value={`${new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ`} icon="💰" color="text-blue-600" bg="bg-blue-50" />
                <StatCard title="Đơn hàng" value={stats.totalOrders} icon="📦" color="text-emerald-600" bg="bg-emerald-50" />
                <StatCard title="Thành viên" value={stats.totalUsers} icon="👥" color="text-violet-600" bg="bg-violet-50" />
                <StatCard title="Sản phẩm" value={stats.totalProducts} icon="🎮" color="text-red-600" bg="bg-red-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* BIỂU ĐỒ DOANH THU */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-8">Biến động doanh thu 7 ngày</h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                                <YAxis hide />
                                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ĐƠN HÀNG MỚI NHẤT */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-6">Đơn hàng mới</h3>
                    <div className="space-y-5">
                        {stats.recentOrders.map((order, idx) => (
                            <div key={idx} className="flex justify-between items-center group border-b border-slate-50 pb-3 last:border-0">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">#{order.orderId}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ</p>
                                    <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded uppercase font-black">{order.status || 'Mới'}</span>
                                </div>
                            </div>
                        ))}
                        {stats.recentOrders.length === 0 && <p className="text-slate-400 text-sm italic">Chưa có đơn hàng nào.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, bg }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all cursor-default group">
        <div className={`${bg} ${color} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner`}>{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{value}</h2>
        </div>
    </div>
);

export default Dashboard;