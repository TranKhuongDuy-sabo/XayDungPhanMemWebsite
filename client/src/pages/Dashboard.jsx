import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiTrendingUp, FiClock, FiActivity } from 'react-icons/fi';

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
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [resOrders, resProducts, resUsers] = await Promise.all([
                    axios.get(`${API_BASE_URL}/Orders`, { headers }),
                    axios.get(`${API_BASE_URL}/Products`),
                    axios.get(`${API_BASE_URL}/Accounts/users`, { headers }).catch(() => ({ data: [] }))
                ]);

                const orders = resOrders.data || [];
                const products = resProducts.data || [];
                const allUsers = resUsers.data || [];

                const customers = allUsers.filter(u => u.role !== 'Admin');

                // 🔥 ĐÃ FIX: Chỉ cộng doanh thu của những đơn 'Đã giao'
                const totalRevenue = orders
                    .filter(order => order.status === 'Đã giao')
                    .reduce((sum, order) => sum + order.totalAmount, 0);

                // Lấy 7 ngày gần nhất
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                }).reverse();

                // 🔥 ĐÃ FIX: Biểu đồ cũng chỉ cộng doanh thu của các đơn 'Đã giao' trong ngày đó
                const chartData = last7Days.map(dateStr => {
                    const totalInDay = orders
                        .filter(o => 
                            o.status === 'Đã giao' && 
                            new Date(o.orderDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) === dateStr
                        )
                        .reduce((sum, o) => sum + o.totalAmount, 0);
                    return { name: dateStr, total: totalInDay };
                });

                setStats({
                    totalRevenue: totalRevenue, // 🔥 ĐÃ FIX lỗi tên biến (chỗ này trước là 'revenue')
                    totalOrders: orders.length, // Tổng số đơn (tính cả bị hủy để biết volume)
                    totalProducts: products.length,
                    totalUsers: customers.length,
                    chartData: chartData,
                    recentOrders: orders.slice(0, 5) 
                });

            } catch (error) {
                console.error("Lỗi xử lý dữ liệu Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            <div className="font-black text-slate-400 uppercase tracking-widest animate-pulse">SaboTech đang tổng hợp dữ liệu...</div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans animate-fadeIn">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <FiActivity className="text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tổng quan Hệ thống</h1>
                        <p className="text-slate-500 font-medium">Báo cáo doanh thu và hoạt động SaboTech</p>
                    </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE DATA
                </div>
            </div>

            {/* --- CÁC CARD THỐNG KÊ KẾT HỢP GLASSMORPHISM --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Tổng doanh thu" value={`${new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ`} icon={<FiDollarSign />} color="text-blue-600" bg="bg-blue-50" />
                <StatCard title="Đơn hàng" value={stats.totalOrders} icon={<FiShoppingBag />} color="text-emerald-600" bg="bg-emerald-50" />
                <StatCard title="Khách hàng" value={stats.totalUsers} icon={<FiUsers />} color="text-violet-600" bg="bg-violet-50" />
                <StatCard title="Sản phẩm kho" value={stats.totalProducts} icon={<FiBox />} color="text-amber-600" bg="bg-amber-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* BIỂU ĐỒ DOANH THU */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-8 flex items-center gap-2 relative z-10">
                        <FiTrendingUp className="text-blue-600 text-lg" /> Biến động doanh thu 7 ngày (Giao thành công)
                    </h3>

                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 'bold', color: '#1e293b' }}
                                    itemStyle={{ color: '#3b82f6', fontWeight: '900' }}
                                    formatter={(value) => [`${new Intl.NumberFormat('vi-VN').format(value)}đ`, 'Doanh thu']}
                                />
                                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ĐƠN HÀNG MỚI NHẤT */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col">
                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
                        <FiClock className="text-emerald-500 text-lg" /> Đơn hàng mới
                    </h3>
                    <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {stats.recentOrders.map((order, idx) => (
                            <div key={idx} className="flex justify-between items-center group p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs shadow-inner">
                                        #{order.orderId || order.id}
                                    </div>
                                    <div>
                                        {/* 🔥 ĐÃ FIX: Lấy tên khách hàng thật */}
                                        <p className="font-bold text-slate-800 text-sm line-clamp-1">{order.customerName || order.username || 'Khách vãng lai'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ</p>
                                    <span className="inline-block mt-1 text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase font-black">{order.status || 'Mới'}</span>
                                </div>
                            </div>
                        ))}
                        {stats.recentOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                                <FiShoppingBag className="text-5xl mb-3" />
                                <p className="text-sm italic font-medium">Chưa có đơn hàng nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, bg }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 hover:-translate-y-1 transition-all cursor-default group relative overflow-hidden">
        <div className={`absolute -right-6 -top-6 w-24 h-24 ${bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
        <div className={`${bg} ${color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner relative z-10`}>
            {icon}
        </div>
        <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h2>
        </div>
    </div>
);

export default Dashboard;