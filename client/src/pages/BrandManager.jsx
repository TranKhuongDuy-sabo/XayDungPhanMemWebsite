import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast'; // Nhớ check lại đường dẫn Toast
import { FiTag, FiEdit, FiTrash2, FiSave, FiList, FiPlusCircle, FiAlertTriangle, FiGlobe } from 'react-icons/fi';

const BrandManager = () => {
    const API_BASE_URL = 'http://localhost:5164/api/Brands'; 
    
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', origin: '' });
    
    // STATE CHO MODAL XÓA
    const [brandToDelete, setBrandToDelete] = useState(null);

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
        } catch (error) {
            showToast("Lỗi tải dữ liệu thương hiệu!", "error");
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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
                showToast("Cập nhật thương hiệu thành công!", "success");
            } else {
                // CREATE (POST)
                await axios.post(API_BASE_URL, payload, { headers });
                showToast("Thêm thương hiệu mới thành công!", "success");
            }
            setFormData({ id: '', name: '', origin: '' });
            fetchBrands();
        } catch (error) {
            const errorMessage = error.response?.data?.title || error.response?.data || "Yêu cầu không hợp lệ";
            showToast("Thất bại: " + errorMessage, "error");
        } finally { setLoading(false); }
    };

    // 🔥 HÀM THỰC THI XÓA KHI BẤM XÁC NHẬN TRÊN MODAL
    const executeDelete = async () => {
        if (!brandToDelete) return;
        try {
            const id = brandToDelete.id || brandToDelete.brandId || brandToDelete.BrandId;
            await axios.delete(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() });
            showToast("Đã xóa thương hiệu khỏi hệ thống!", "success");
            setBrandToDelete(null);
            fetchBrands();
        } catch (error) {
            showToast("Không thể xóa! Thương hiệu này đang có sản phẩm.", "error");
            setBrandToDelete(null);
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
        <div className="min-h-screen font-sans animate-fadeIn">
            
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <FiTag className="text-2xl" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Thương hiệu</h1>
                    <p className="text-slate-500 font-medium">Danh sách các hãng sản xuất linh kiện</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* FORM */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 h-fit relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                        {formData.id ? <><FiEdit className="text-indigo-600"/> Cập nhật hãng</> : <><FiPlusCircle className="text-indigo-600"/> Thêm mới hãng</>}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Tên thương hiệu *</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                placeholder="VD: ASUS, Logitech..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><FiGlobe/> Xuất xứ *</label>
                            <input 
                                type="text" 
                                value={formData.origin}
                                onChange={(e) => setFormData({...formData, origin: e.target.value})}
                                required
                                placeholder="VD: Đài Loan, Mỹ..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 active:scale-95">
                            <FiSave className="text-lg" /> {loading ? "ĐANG LƯU..." : (formData.id ? "LƯU THAY ĐỔI" : "XÁC NHẬN THÊM")}
                        </button>
                        {formData.id && (
                            <button type="button" onClick={() => setFormData({ id: '', name: '', origin: '' })} className="w-full text-slate-500 font-bold text-sm uppercase mt-2 hover:bg-slate-100 py-3 rounded-xl transition-colors">
                                Hủy sửa
                            </button>
                        )}
                    </form>
                </div>

                {/* BẢNG THƯƠNG HIỆU */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <FiList className="text-indigo-600" /> Danh sách ({brands.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
                                <tr>
                                    <th className="p-5">Thương hiệu</th>
                                    <th className="p-5">Xuất xứ</th>
                                    <th className="p-5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {brands.map((b) => {
                                    const actualId = b.id || b.brandId || b.BrandId;
                                    const actualName = b.name || b.brandName || b.BrandName;
                                    const actualOrigin = b.origin || b.Origin;

                                    return (
                                        <tr key={actualId} className="hover:bg-indigo-50/30 transition-all group">
                                            <td className="p-5 flex flex-col">
                                                <span className="font-black text-slate-800 text-base">{actualName}</span>
                                                <span className="font-mono text-slate-400 text-[10px] uppercase font-bold tracking-widest">ID: {actualId}</span>
                                            </td>
                                            <td className="p-5 text-slate-500 font-medium">
                                                <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm">{actualOrigin}</span>
                                            </td>
                                            <td className="p-5 text-right space-x-3">
                                                <button onClick={() => handleEditClick(b)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors" title="Sửa">
                                                    <FiEdit />
                                                </button>
                                                <button onClick={() => setBrandToDelete(b)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Xóa">
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
            {brandToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiAlertTriangle className="text-3xl" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Xác nhận xóa?</h3>
                        <p className="text-slate-500 mb-8 text-sm">
                            Bạn sắp xóa thương hiệu <span className="font-bold text-red-500">"{brandToDelete.name || brandToDelete.brandName || brandToDelete.BrandName}"</span>. <br/>Không thể hoàn tác!
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setBrandToDelete(null)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95">Hủy</button>
                            <button onClick={executeDelete} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95">Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandManager;