import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryManager = () => {
    const API_BASE_URL = 'http://localhost:5164/api/Categories';

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', isActive: true });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_BASE_URL);
            setCategories(res.data);
        } catch (error) { console.error("Lỗi fetch:", error); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const headers = getAuthHeaders();

            if (formData.id) {
                // --- TRƯỜNG HỢP CẬP NHẬT (PUT) ---
                // Phải dùng CategoryId và CategoryName để khớp với Model Category ở Backend
                const putPayload = {
                    CategoryId: parseInt(formData.id),
                    CategoryName: formData.name,
                    IsActive: formData.isActive
                };

                // Debug xem dữ liệu chuẩn chưa
                console.log("Dữ liệu sửa gửi đi:", putPayload);

                await axios.put(`${API_BASE_URL}/${formData.id}`, putPayload, { headers });
                alert("✅ Cập nhật danh mục thành công!");
            } else {
                // --- TRƯỜNG HỢP THÊM MỚI (POST) ---
                const postPayload = {
                    CategoryName: formData.name,
                    IsActive: formData.isActive
                };
                await axios.post(API_BASE_URL, postPayload, { headers });
                alert("✅ Thêm danh mục mới thành công!");
            }

            setFormData({ id: '', name: '', isActive: true });
            fetchCategories();
        } catch (error) {
            console.error("Lỗi Server:", error.response?.data);
            // Nếu Backend trả về string đơn giản thay vì object errors
            const errorMessage = typeof error.response?.data === 'string'
                ? error.response.data
                : (error.response?.data?.title || "Lỗi không xác định");

            alert("❌ Thất bại: " + errorMessage);
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`⚠️ Xóa danh mục #${id}?`)) return;
        try {
            await axios.delete(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() });
            fetchCategories();
        } catch (error) { alert("❌ Không thể xóa danh mục này!"); }
    };

    const handleEditClick = (cat) => {
        setFormData({
            id: cat.id || cat.Id,
            name: cat.name || cat.Name,
            isActive: cat.isActive !== undefined ? cat.isActive : cat.IsActive
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 italic">
                <span className="bg-blue-600 p-2 rounded-xl text-white not-italic">📁</span>
                QUẢN LÝ DANH MỤC
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit">
                    <h2 className="text-blue-600 font-black mb-6 uppercase text-xs tracking-widest">
                        {formData.id ? "Cập nhật danh mục" : "Thêm mới danh mục"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Tên danh mục..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full border-2 border-slate-50 rounded-2xl p-4 outline-none focus:border-blue-500 font-bold bg-slate-50 focus:bg-white transition-all"
                        />
                        <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} id="chk" className="w-5 h-5 accent-blue-600" />
                            <label htmlFor="chk" className="text-sm font-black text-blue-900 cursor-pointer">Hiển thị trên website</label>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95">
                            {loading ? "ĐANG XỬ LÝ..." : (formData.id ? "LƯU THAY ĐỔI" : "XÁC NHẬN THÊM")}
                        </button>
                        {formData.id && (
                            <button type="button" onClick={() => setFormData({ id: '', name: '', isActive: true })} className="w-full text-slate-400 font-bold text-xs uppercase mt-2">Hủy bỏ</button>
                        )}
                    </form>
                </div>

                {/* BẢNG */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 font-black text-[10px] text-slate-400 uppercase">
                            <tr>
                                <th className="p-5">Mã</th>
                                <th className="p-5">Tên danh mục</th>
                                <th className="p-5 text-center">Trạng thái</th>
                                <th className="p-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {categories.map((cat, index) => {
                                const id = cat.id || cat.Id;
                                const name = cat.name || cat.Name;
                                const active = cat.isActive !== undefined ? cat.isActive : cat.IsActive;
                                return (
                                    <tr key={id || index} className="hover:bg-blue-50/20 transition-all">
                                        <td className="p-5 font-mono text-slate-300 text-xs">#{id}</td>
                                        <td className="p-5 font-black text-slate-700">{name}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {active ? "Online" : "Hidden"}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right space-x-3">
                                            <button onClick={() => handleEditClick(cat)} className="text-blue-600 font-black text-[10px] uppercase hover:underline">Sửa</button>
                                            <button onClick={() => handleDelete(id)} className="text-red-400 font-black text-[10px] uppercase hover:text-red-600">Xóa</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;