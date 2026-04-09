import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BrandManager = () => {
    // 1. CẤU HÌNH API
    const API_BASE_URL = 'http://localhost:5164/api/Brands'; 
    
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', origin: '' });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        };
    };

    useEffect(() => { fetchBrands(); }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_BASE_URL);
            setBrands(res.data);
            console.log("Dữ liệu Brands từ Backend:", res.data);
        } catch (error) {
            console.error("Lỗi fetch brands:", error);
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 🔥 ÉP KIỂU PASCALCASE ĐỂ KHỚP VỚI MODEL C# (BrandName, Origin)
        const payload = {
            BrandName: formData.name,
            Origin: formData.origin
        };

        try {
            const headers = getAuthHeaders();
            if (formData.id) {
                // UPDATE (PUT)
                await axios.put(`${API_BASE_URL}/${formData.id}`, 
                    { ...payload, BrandId: parseInt(formData.id) }, 
                    { headers }
                );
                alert("✅ Cập nhật thương hiệu thành công!");
            } else {
                // CREATE (POST)
                await axios.post(API_BASE_URL, payload, { headers });
                alert("✅ Thêm thương hiệu mới thành công!");
            }
            setFormData({ id: '', name: '', origin: '' });
            fetchBrands();
        } catch (error) {
            console.error("Lỗi Server:", error.response?.data);
            alert("❌ Thất bại: " + (error.response?.data?.title || "Yêu cầu không hợp lệ"));
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`⚠️ Xóa thương hiệu #${id}?`)) return;
        try {
            await axios.delete(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() });
            fetchBrands();
        } catch (error) {
            alert("❌ Không thể xóa! Thương hiệu này có thể đang có sản phẩm.");
        }
    };

    const handleEditClick = (b) => {
        setFormData({
            id: b.id || b.brandId || b.BrandId,
            name: b.name || b.brandName || b.BrandName,
            origin: b.origin || b.Origin || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-black text-slate-800 mb-8 uppercase flex items-center gap-2 italic">
                <span className="bg-amber-500 p-2 rounded-lg text-white not-italic">🏷️</span> 
                Quản lý Thương hiệu
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit">
                    <h2 className="text-amber-600 font-black mb-6 uppercase text-xs">
                        {formData.id ? "✏️ Sửa thương hiệu" : "➕ Thêm thương hiệu"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên thương hiệu</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                placeholder="VD: ASUS, Logitech..."
                                className="w-full mt-1 border-2 border-slate-50 rounded-2xl p-4 outline-none focus:border-amber-500 bg-slate-50 font-bold"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Xuất xứ</label>
                            <input 
                                type="text" 
                                value={formData.origin}
                                onChange={(e) => setFormData({...formData, origin: e.target.value})}
                                required
                                placeholder="VD: Đài Loan, Mỹ..."
                                className="w-full mt-1 border-2 border-slate-50 rounded-2xl p-4 outline-none focus:border-amber-500 bg-slate-50 font-bold"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-100 transition-all">
                            {loading ? "ĐANG LƯU..." : (formData.id ? "CẬP NHẬT" : "THÊM MỚI")}
                        </button>
                    </form>
                </div>

                {/* BẢNG */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                            <tr>
                                <th className="p-5">Mã</th>
                                <th className="p-5">Thương hiệu</th>
                                <th className="p-5">Xuất xứ</th>
                                <th className="p-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                            {brands.map((b) => (
                                <tr key={b.id || b.brandId || b.BrandId} className="hover:bg-amber-50/30 transition-all">
                                    <td className="p-5 text-slate-300 text-xs">#{b.id || b.brandId || b.BrandId}</td>
                                    <td className="p-5">{b.name || b.brandName || b.BrandName}</td>
                                    <td className="p-5 text-slate-500 text-sm">{b.origin || b.Origin}</td>
                                    <td className="p-5 text-right space-x-3">
                                        <button onClick={() => handleEditClick(b)} className="text-amber-600 text-[10px] uppercase">Sửa</button>
                                        <button onClick={() => handleDelete(b.id || b.brandId || b.BrandId)} className="text-red-400 text-[10px] uppercase">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BrandManager;