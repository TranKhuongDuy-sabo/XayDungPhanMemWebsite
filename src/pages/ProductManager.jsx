import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast';
import {
    FiBox, FiTag, FiList, FiImage, FiSearch,
    FiEdit, FiTrash2, FiStar, FiSave, FiPlusCircle, FiAlertTriangle
} from 'react-icons/fi';

const ProductManager = () => {
    const API_BASE_URL = 'http://localhost:5164/api';
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { 'Authorization': `Bearer ${token}` };
    };

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 🔥 STATE CHO MODAL XÓA
    const [productToDelete, setProductToDelete] = useState(null);

    const initialFormState = {
        productId: '',
        productName: '',
        price: '',
        stock: '',
        description: '',
        isActive: true,
        isFeatured: false,
        imageUrl: '',
        imageFile: null,
        categoryId: '',
        brandId: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [resP, resC, resB] = await Promise.all([
                axios.get(`${API_BASE_URL}/Products`),
                axios.get(`${API_BASE_URL}/Categories`).catch(() => ({ data: [] })),
                axios.get(`${API_BASE_URL}/Brands`).catch(() => ({ data: [] }))
            ]);
            setProducts(resP.data);
            setCategories(resC.data);
            setBrands(resB.data);
        } catch (error) {
            showToast("Lỗi tải dữ liệu từ máy chủ!", "error");
        } finally { setLoading(false); }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                imageFile: file,
                imageUrl: URL.createObjectURL(file)
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = new FormData();
        if (formData.productId) submitData.append('ProductId', formData.productId);
        submitData.append('ProductName', formData.productName);
        submitData.append('Price', formData.price);
        submitData.append('Stock', formData.stock);
        submitData.append('CategoryId', parseInt(formData.categoryId) || 0);
        submitData.append('BrandId', parseInt(formData.brandId) || 0);
        submitData.append('Description', formData.description || '');

        // Chuyển Boolean thành String để C# đọc chuẩn xác nhất
        submitData.append('IsActive', String(formData.isActive));
        submitData.append('IsFeatured', String(formData.isFeatured));

        if (formData.imageFile) submitData.append('ImageFile', formData.imageFile);

        try {
            if (formData.productId) {
                await axios.put(`${API_BASE_URL}/Products/${formData.productId}`, submitData, { headers: getAuthHeaders() });
                showToast("Cập nhật sản phẩm thành công!", "success");
            } else {
                await axios.post(`${API_BASE_URL}/Products`, submitData, { headers: getAuthHeaders() });
                showToast("Đã thêm sản phẩm mới vào kho!", "success");
            }
            handleResetForm();
            fetchInitialData();
        } catch (error) {
            showToast(error.response?.data?.message || "Kiểm tra lại dữ liệu nhập!", "error");
        } finally { setLoading(false); }
    };

    const handleResetForm = () => {
        setFormData(initialFormState);
        if (document.getElementById('imageUploader')) document.getElementById('imageUploader').value = '';
    };

    const handleEditClick = async (p) => {
        const actualId = p.productId || p.id;
        try {
            const res = await axios.get(`${API_BASE_URL}/Products/${actualId}`);
            const detail = res.data;

            setFormData({
                productId: detail.id || detail.productId || '',
                productName: detail.name || detail.productName || '',
                price: detail.price || 0,
                stock: detail.stock || 0,
                description: detail.description || '',
                isActive: detail.isActive !== undefined ? detail.isActive : true,
                isFeatured: detail.isFeatured || false,
                categoryId: String(detail.categoryId || ''),
                brandId: String(detail.brandId || ''),
                imageUrl: detail.image || detail.imageUrl || '',
                imageFile: null
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            showToast("Không thể tải chi tiết sản phẩm để sửa!", "error");
        }
    };

    // 🔥 FIX 2: CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC TRƯỚC KHI GỌI API
    const handleQuickToggle = async (product, field) => {
        const actualId = product.productId || product.id;
        const updatedValue = !product[field]; // Đảo ngược giá trị hiện tại

        // 1. Thay đổi trạng thái trên giao diện NGAY LẬP TỨC để hết bị giật
        setProducts(products.map(p =>
            (p.productId || p.id) === actualId ? { ...p, [field]: updatedValue } : p
        ));

        try {
            const res = await axios.get(`${API_BASE_URL}/Products/${actualId}`);
            const detail = res.data;

            const submitData = new FormData();
            submitData.append('ProductId', actualId);
            submitData.append('ProductName', detail.name || detail.productName);
            submitData.append('Price', detail.price);
            submitData.append('Stock', detail.stock);
            submitData.append('CategoryId', detail.categoryId || 0);
            submitData.append('BrandId', detail.brandId || 0);
            submitData.append('Description', detail.description || '');

            // Ép kiểu String cho an toàn với C# Form Data
            submitData.append('IsActive', String(field === 'isActive' ? updatedValue : (detail.isActive !== undefined ? detail.isActive : true)));
            submitData.append('IsFeatured', String(field === 'isFeatured' ? updatedValue : (detail.isFeatured || false)));

            await axios.put(`${API_BASE_URL}/Products/${actualId}`, submitData, { headers: getAuthHeaders() });
            showToast(`Đã thay đổi trạng thái hiển thị!`, "success");

            // LƯU Ý: Không cần gọi fetchInitialData() nữa vì danh sách local đã chuẩn rồi, gọi lại sẽ làm giật UI
        } catch (error) {
            // Nếu API lỗi, trả giao diện về như cũ
            setProducts(products.map(p =>
                (p.productId || p.id) === actualId ? { ...p, [field]: !updatedValue } : p
            ));
            showToast("Lỗi khi thay đổi trạng thái!", "error");
        }
    };

    // 🔥 FIX 1: HÀM THỰC THI XÓA (KHI BẤM ĐỒNG Ý TRÊN MODAL)
    const executeDelete = async () => {
        if (!productToDelete) return;
        try {
            const id = productToDelete.productId || productToDelete.id;
            await axios.delete(`${API_BASE_URL}/Products/${id}`, { headers: getAuthHeaders() });
            showToast(`Đã xóa "${productToDelete.productName || productToDelete.name}"`, "success");
            setProductToDelete(null);
            fetchInitialData();
        } catch (error) {
            showToast("Lỗi: Không thể xóa sản phẩm này!", "error");
            setProductToDelete(null);
        }
    };

    const removeAccents = (str) => {
        return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
    };

    const filteredProducts = products.filter(p => {
        const searchStr = removeAccents(searchTerm);
        const nameStr = removeAccents(p.productName || p.name);
        return nameStr.includes(searchStr);
    });

    return (
        <div className="min-h-screen font-sans animate-fadeIn">

            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <FiBox className="text-2xl" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Sản phẩm</h1>
                    <p className="text-slate-500 font-medium">Thêm, sửa, xóa và kiểm soát kho hàng SaboTech</p>
                </div>
            </div>

            {/* FORM */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                    {formData.productId ? <><FiEdit className="text-blue-600" /> Sửa sản phẩm #{formData.productId}</> : <><FiPlusCircle className="text-blue-600" /> Thêm sản phẩm mới</>}
                </h2>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Tên sản phẩm *</label>
                                <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" placeholder="Nhập tên sản phẩm..." />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Giá bán (VNĐ) *</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-blue-600" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Tồn kho *</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><FiList /> Danh mục *</label>
                                    <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium cursor-pointer">
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(c => <option key={c.id || c.categoryId} value={c.id || c.categoryId}>{c.name || c.categoryName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><FiTag /> Thương hiệu *</label>
                                    <select name="brandId" value={formData.brandId} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium cursor-pointer">
                                        <option value="">-- Chọn hãng --</option>
                                        {brands.map(b => <option key={b.id || b.brandId} value={b.id || b.brandId}>{b.name || b.brandName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Mô tả chi tiết</label>
                                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" placeholder="Thông số kỹ thuật..."></textarea>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><FiImage /> Hình ảnh</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-2 bg-slate-50 text-center hover:bg-slate-100 transition-colors relative group overflow-hidden">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="preview" className="w-full h-48 object-contain rounded-xl bg-white" />
                                    ) : (
                                        <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                                            <FiImage className="text-4xl mb-2" />
                                            <span className="text-sm font-medium">Click chọn ảnh</span>
                                        </div>
                                    )}
                                    <input type="file" id="imageUploader" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="sr-only" />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Đang kinh doanh</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="sr-only" />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isFeatured ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isFeatured ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">Sản phẩm nổi bật <FiStar className={formData.isFeatured ? "text-amber-500 fill-amber-500" : "text-slate-400"} /></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex gap-4">
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all">
                            <FiSave className="text-lg" /> {loading ? 'ĐANG LƯU...' : (formData.productId ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM SẢN PHẨM')}
                        </button>
                        {formData.productId && (
                            <button type="button" onClick={handleResetForm} className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                                Hủy Sửa
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* BẢNG */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <FiList className="text-blue-600" /> Danh sách sản phẩm ({filteredProducts.length})
                    </h2>
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm không dấu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-[10px] uppercase text-slate-500 tracking-widest">
                            <tr>
                                <th className="p-5 whitespace-nowrap">Sản phẩm</th>
                                <th className="p-5 text-center">Giá & Kho</th>
                                <th className="p-5 text-center">Hiển thị</th>
                                <th className="p-5 text-center">Nổi bật</th>
                                <th className="p-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length > 0 ? filteredProducts.map((p) => {
                                const actualId = p.productId || p.id;
                                return (
                                    <tr key={actualId} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-5 flex items-center gap-4">
                                            <img src={p.image || p.imageUrl || 'https://via.placeholder.com/50'} className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-sm bg-white" alt="product" onError={(e) => e.target.src = 'https://via.placeholder.com/50'} />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-sm line-clamp-1">{p.productName || p.name}</span>

                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {actualId}</span>

                                                    {p.categoryIsActive === false && (
                                                        <span className="bg-red-50 text-red-600 text-[8px] px-2 py-0.5 rounded-md font-black uppercase border border-red-200 shadow-sm animate-pulse" title="Sản phẩm này sẽ không hiện trên web do Danh Mục đã bị tắt">
                                                            ⚠️ Danh mục ẩn
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-5 text-center">
                                            <div className="font-black text-blue-600 text-sm">{new Intl.NumberFormat('vi-VN').format(p.price || 0)}đ</div>
                                            <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Kho: <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{p.stock || 0}</span></div>
                                        </td>

                                        <td className="p-5 text-center">
                                            <button onClick={() => handleQuickToggle(p, 'isActive')} className="relative inline-flex items-center cursor-pointer group/toggle focus:outline-none">
                                                <div className={`w-11 h-6 rounded-full transition-colors ${p.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${p.isActive ? 'translate-x-5' : ''}`}></div>
                                            </button>
                                        </td>

                                        <td className="p-5 text-center">
                                            <button onClick={() => handleQuickToggle(p, 'isFeatured')} className={`text-2xl transition-all hover:scale-110 focus:outline-none ${p.isFeatured ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-200'}`}>
                                                <FiStar className={p.isFeatured ? "fill-amber-400" : ""} />
                                            </button>
                                        </td>

                                        <td className="p-5 text-right space-x-3 whitespace-nowrap">
                                            <button onClick={() => handleEditClick(p)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="Sửa">
                                                <FiEdit />
                                            </button>

                                            {/* 🔥 Đổi nút Xóa để gọi Modal thay vì window.confirm */}
                                            <button onClick={() => setProductToDelete(p)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Xóa">
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-slate-500 font-medium">
                                        Không tìm thấy sản phẩm nào!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🔥 MODAL XÓA SẢN PHẨM */}
            {productToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiAlertTriangle className="text-3xl" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Xác nhận xóa?</h3>
                        <p className="text-slate-500 mb-8 text-sm">
                            Bạn sắp xóa vĩnh viễn sản phẩm <br />
                            <span className="font-black text-red-500 text-base">"{productToDelete.productName || productToDelete.name}"</span>. <br />
                            Hành động này không thể hoàn tác!
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setProductToDelete(null)}
                                className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 active:scale-95"
                            >
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProductManager;