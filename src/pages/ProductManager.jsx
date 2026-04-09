import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    // 1. CẬP NHẬT TRẠNG THÁI BAN ĐẦU
    const initialFormState = {
        productId: '',
        productName: '',
        price: '',
        stock: '',
        description: '', // Đã thêm
        isActive: true,  // Mặc định là đang kinh doanh
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
            console.error("Lỗi fetch:", error);
        } finally { setLoading(false); }
    };

    // 2. XỬ LÝ THAY ĐỔI INPUT (CÓ THÊM CHECKBOX)
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Nếu là checkbox thì lấy giá trị checked, ngược lại lấy value
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
        submitData.append('CategoryId', formData.categoryId);
        submitData.append('BrandId', formData.brandId);
        submitData.append('Description', formData.description || '');
        submitData.append('IsActive', formData.isActive); // Gửi trạng thái lên C#

        if (formData.imageFile) submitData.append('ImageFile', formData.imageFile);

        try {
            if (formData.productId) {
                await axios.put(`${API_BASE_URL}/Products/${formData.productId}`, submitData, { headers: getAuthHeaders() });
                alert("✅ Cập nhật thành công!");
            } else {
                await axios.post(`${API_BASE_URL}/Products`, submitData, { headers: getAuthHeaders() });
                alert("✅ Thêm mới thành công!");
            }
            setFormData(initialFormState);
            if (document.getElementById('imageUploader')) document.getElementById('imageUploader').value = '';
            fetchInitialData();
        } catch (error) {
            alert("❌ Lỗi: " + (error.response?.data?.title || "Kiểm tra lại dữ liệu!"));
        } finally { setLoading(false); }
    };

    const handleEditClick = (p) => {
        setFormData({
            productId: p.productId || p.id || '',
            productName: p.productName || p.name || '',
            price: p.price || 0,
            stock: p.stock || 0,
            description: p.description || '', // Map dữ liệu mô tả
            isActive: p.isActive !== undefined ? p.isActive : true, // Map dữ liệu trạng thái
            categoryId: String(p.categoryId || ''),
            brandId: String(p.brandId || ''),
            imageUrl: p.image || p.imageUrl || '',
            imageFile: null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!id) return;
        if (!window.confirm(`⚠️ Xóa vĩnh viễn sản phẩm #${id}?`)) return;
        try {
            await axios.delete(`${API_BASE_URL}/Products/${id}`, { headers: getAuthHeaders() });
            alert("✅ Đã xóa!");
            fetchInitialData();
        } catch (error) {
            alert("❌ Lỗi xóa!");
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            <h1 className="text-2xl font-black mb-6 italic tracking-tight uppercase">📦 Quản lý kho hàng SaboTech</h1>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Tên sản phẩm */}
                        <div className="md:col-span-3">
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Tên sản phẩm</label>
                            <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} required className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" placeholder="Ví dụ: Laptop Gaming ASUS TUF..." />
                        </div>

                        {/* Giá và Kho */}
                        <div><label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Giá bán (VNĐ)</label><input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" /></div>
                        <div><label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Số lượng tồn</label><input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all" /></div>
                        
                        {/* Danh mục */}
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Danh mục</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all">
                                <option value="">Chọn loại...</option>
                                {categories.map(c => <option key={c.id || c.categoryId} value={c.id || c.categoryId}>{c.name || c.categoryName}</option>)}
                            </select>
                        </div>

                        {/* Thương hiệu */}
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Thương hiệu</label>
                            <select name="brandId" value={formData.brandId} onChange={handleInputChange} required className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all">
                                <option value="">Chọn hãng...</option>
                                {brands.map(b => <option key={b.id || b.brandId} value={b.id || b.brandId}>{b.name || b.brandName}</option>)}
                            </select>
                        </div>

                        {/* Hình ảnh */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Hình ảnh sản phẩm</label>
                            <input type="file" id="imageUploader" onChange={handleImageChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                    </div>

                    {/* 🔥 3. THÊM Ô MÔ TẢ (DESCRIPTION) */}
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Mô tả sản phẩm</label>
                        <textarea 
                            name="description" 
                            rows="4" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            className="w-full border-2 border-slate-100 rounded-xl p-3 focus:border-blue-600 outline-none transition-all"
                            placeholder="Nhập thông số kỹ thuật, cấu hình chi tiết..."
                        ></textarea>
                    </div>

                    {/* 🔥 4. THÊM CHECKBOX TRẠNG THÁI (IS ACTIVE) */}
                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl w-fit">
                        <input 
                            type="checkbox" 
                            name="isActive" 
                            id="isActive"
                            checked={formData.isActive} 
                            onChange={handleInputChange} 
                            className="w-5 h-5 accent-blue-600 cursor-pointer"
                        />
                        <label htmlFor="isActive" className="text-sm font-bold text-blue-900 cursor-pointer select-none">
                            Đang kinh doanh (Hiển thị lên trang bán hàng)
                        </label>
                    </div>

                    <div>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                            {loading ? 'ĐANG XỬ LÝ...' : (formData.productId ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM VÀO KHO')}
                        </button>
                    </div>
                </form>
            </div>

            {/* BẢNG DANH SÁCH SẢN PHẨM (GIỮ NGUYÊN NHƯ CŨ NHƯNG THÊM CỘT STATUS) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b font-bold text-[10px] uppercase text-slate-400 tracking-widest">
                        <tr>
                            <th className="p-5">Sản phẩm</th>
                            <th className="p-5 text-center">Trạng thái</th>
                            <th className="p-5">Giá</th>
                            <th className="p-5 text-center">Kho</th>
                            <th className="p-5 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {products.map((p, index) => {
                            const actualId = p.productId || p.id;
                            return (
                                <tr key={actualId || index} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-5 flex items-center gap-4">
                                        <img src={p.image || 'https://via.placeholder.com/50'} className="w-12 h-12 object-cover rounded-xl border border-slate-100 shadow-sm" alt="product" onError={(e) => e.target.src = 'https://via.placeholder.com/50'} />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">{p.productName || p.name}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {actualId}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${p.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {p.isActive ? 'Đang bán' : 'Ẩn'}
                                        </span>
                                    </td>
                                    <td className="p-5 font-black text-slate-900">{new Intl.NumberFormat('vi-VN').format(p.price || 0)}đ</td>
                                    <td className="p-5 text-center"><span className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-black text-slate-600">{p.stock || 0}</span></td>
                                    <td className="p-5 text-right space-x-4">
                                        <button onClick={() => handleEditClick(p)} className="text-blue-600 font-black text-xs hover:underline uppercase">Sửa</button>
                                        <button onClick={() => handleDelete(actualId)} className="text-red-400 font-black text-xs hover:text-red-600 uppercase">Xóa</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductManager;