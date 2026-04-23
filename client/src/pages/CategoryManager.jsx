import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast'; // Đảm bảo đúng đường dẫn
import { FiFolder, FiEdit, FiTrash2, FiSave, FiList, FiPlusCircle, FiAlertTriangle } from 'react-icons/fi';

const CategoryManager = () => {
    const API_BASE_URL = 'http://localhost:5164/api/Categories';

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', isActive: true });
    
    // STATE CHO MODAL XÓA
    const [categoryToDelete, setCategoryToDelete] = useState(null);

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
        } catch (error) { 
            showToast("Lỗi tải danh mục từ máy chủ!", "error"); 
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const headers = getAuthHeaders();

            if (formData.id) {
                const putPayload = {
                    CategoryId: parseInt(formData.id),
                    CategoryName: formData.name,
                    IsActive: formData.isActive
                };
                await axios.put(`${API_BASE_URL}/${formData.id}`, putPayload, { headers });
                showToast("Cập nhật danh mục thành công!", "success");
            } else {
                const postPayload = {
                    CategoryName: formData.name,
                    IsActive: formData.isActive
                };
                await axios.post(API_BASE_URL, postPayload, { headers });
                showToast("Thêm danh mục mới thành công!", "success");
            }

            setFormData({ id: '', name: '', isActive: true });
            fetchCategories();
        } catch (error) {
            const errorMessage = typeof error.response?.data === 'string'
                ? error.response.data
                : (error.response?.data?.title || "Lỗi không xác định");
            showToast("Thất bại: " + errorMessage, "error");
        } finally { setLoading(false); }
    };

    // 🔥 HÀM GẠT NÚT ĐỔI TRẠNG THÁI (OPTIMISTIC UI)
    const handleQuickToggle = async (cat) => {
        const actualId = cat.id || cat.Id;
        const currentActive = cat.isActive !== undefined ? cat.isActive : cat.IsActive;
        const updatedValue = !currentActive;

        // Cập nhật UI ngay lập tức
        setCategories(categories.map(c => 
            (c.id || c.Id) === actualId ? { ...c, isActive: updatedValue, IsActive: updatedValue } : c
        ));

        try {
            const putPayload = {
                CategoryId: parseInt(actualId),
                CategoryName: cat.name || cat.Name,
                IsActive: updatedValue
            };
            await axios.put(`${API_BASE_URL}/${actualId}`, putPayload, { headers: getAuthHeaders() });
            showToast("Đã thay đổi trạng thái danh mục!", "success");
        } catch (error) {
            // Lỗi thì hoàn tác
            setCategories(categories.map(c => 
                (c.id || c.Id) === actualId ? { ...c, isActive: currentActive, IsActive: currentActive } : c
            ));
            showToast("Lỗi khi thay đổi trạng thái!", "error");
        }
    };

    const executeDelete = async () => {
        if (!categoryToDelete) return;
        try {
            const id = categoryToDelete.id || categoryToDelete.Id;
            await axios.delete(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() });
            showToast("Đã xóa danh mục thành công!", "success");
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) { 
            showToast("Không thể xóa danh mục này (Có thể đang chứa SP)!", "error"); 
            setCategoryToDelete(null);
        }
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
        <div className="min-h-screen font-sans animate-fadeIn">
            
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <FiFolder className="text-2xl" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Danh mục</h1>
                    <p className="text-slate-500 font-medium">Phân loại và sắp xếp kho hàng</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 h-fit relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                        {formData.id ? <><FiEdit className="text-blue-600"/> Cập nhật danh mục</> : <><FiPlusCircle className="text-blue-600"/> Thêm mới</>}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Tên danh mục *</label>
                            <input
                                type="text"
                                placeholder="Nhập tên..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                            />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="relative">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only" />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-sm font-bold text-slate-700">Hiển thị trên website</span>
                        </label>

                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95">
                            <FiSave className="text-lg" /> {loading ? "ĐANG XỬ LÝ..." : (formData.id ? "LƯU THAY ĐỔI" : "XÁC NHẬN THÊM")}
                        </button>
                        {formData.id && (
                            <button type="button" onClick={() => setFormData({ id: '', name: '', isActive: true })} className="w-full text-slate-500 font-bold text-sm uppercase mt-2 hover:bg-slate-100 py-3 rounded-xl transition-colors">Hủy sửa</button>
                        )}
                    </form>
                </div>

                {/* BẢNG DANH MỤC */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <FiList className="text-blue-600" /> Danh sách ({categories.length})
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
                                <tr>
                                    <th className="p-5">Mã & Tên</th>
                                    <th className="p-5 text-center">Hiển thị</th>
                                    <th className="p-5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories.map((cat) => {
                                    const id = cat.id || cat.Id;
                                    const name = cat.name || cat.Name;
                                    const active = cat.isActive !== undefined ? cat.isActive : cat.IsActive;
                                    
                                    return (
                                        <tr key={id} className="hover:bg-blue-50/30 transition-all group">
                                            <td className="p-5 flex flex-col">
                                                <span className="font-black text-slate-800 text-base">{name}</span>
                                                <span className="font-mono text-slate-400 text-[10px] uppercase font-bold tracking-widest">ID: {id}</span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <button onClick={() => handleQuickToggle(cat)} className="relative inline-flex items-center cursor-pointer focus:outline-none">
                                                    <div className={`w-11 h-6 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${active ? 'translate-x-5' : ''}`}></div>
                                                </button>
                                            </td>
                                            <td className="p-5 text-right space-x-3">
                                                <button onClick={() => handleEditClick(cat)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="Sửa">
                                                    <FiEdit />
                                                </button>
                                                <button onClick={() => setCategoryToDelete(cat)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Xóa">
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 🔥 MODAL XÓA */}
            {categoryToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiAlertTriangle className="text-3xl" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Xác nhận xóa?</h3>
                        <p className="text-slate-500 mb-8 text-sm">
                            Bạn sắp xóa danh mục <span className="font-bold text-red-500">"{categoryToDelete.name || categoryToDelete.Name}"</span>. <br/>Không thể hoàn tác!
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setCategoryToDelete(null)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Hủy</button>
                            <button onClick={executeDelete} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all">Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;