import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductManager = () => {
    // --- 1. CẤU HÌNH API & TOKEN ---
    const API_BASE_URL = 'http://localhost:5164/api';
    
    // Hàm lấy Token chuẩn bị gửi cho Backend
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token'); // Lấy token từ lúc đăng nhập
        return {
            'Authorization': `Bearer ${token}`,
            // Không set 'Content-Type' ở đây khi dùng FormData, Axios sẽ tự động set 'multipart/form-data'
        };
    };

    // --- 2. STATE QUẢN LÝ DỮ LIỆU ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);

    const initialFormState = { id: '', name: '', price: '', stock: '', description: '', imageUrl: '', imageFile: null, categoryId: '' };
    const [formData, setFormData] = useState({ ...initialFormState, brandId: '' });

    // --- 3. FETCH DỮ LIỆU KHI MỞ TRANG ---
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Lấy danh sách Sản phẩm (API này hôm trước không cần Token)
            const resProducts = await axios.get(`${API_BASE_URL}/Products`);
            setProducts(resProducts.data);

            // Cố gắng lấy Categories & Brands (Nếu API này chưa có, nó sẽ bắt lỗi nhưng không sập web)
            try {
                const resCats = await axios.get(`${API_BASE_URL}/Categories`);
                setCategories(resCats.data);
            } catch (e) { console.log("Chưa có API Categories, dùng tạm mốc 1,2,3"); }

            try {
                const resBrands = await axios.get(`${API_BASE_URL}/Brands`);
                setBrands(resBrands.data);
            } catch (e) { console.log("Chưa có API Brands, dùng tạm mốc 1,2,3"); }
            
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        }
        setLoading(false);
    };

    // --- 4. XỬ LÝ NHẬP LIỆU ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files;
        if (file) {
            setFormData({ 
                ...formData, 
                imageFile: file, 
                imageUrl: URL.createObjectURL(file) // Tạo link ảo xem trước ảnh
            });
        }
    };

    // --- 5. LƯU (THÊM / CẬP NHẬT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Vì Backend dùng [FromForm], ta phải gói dữ liệu vào FormData
        const submitData = new FormData();
        if (formData.id) submitData.append('ProductId', formData.id);
        submitData.append('ProductName', formData.name);
        submitData.append('Price', formData.price);
        submitData.append('Stock', formData.stock);
        submitData.append('CategoryId', formData.categoryId || 1); // Tránh bị rỗng
        submitData.append('BrandId', formData.brandId || 1);
        if (formData.description) submitData.append('Description', formData.description);
        
        // Nếu có chọn file ảnh mới thì mới đính kèm lên
        if (formData.imageFile) {
            submitData.append('ImageFile', formData.imageFile);
        }

        try {
            if (formData.id) {
                // ĐANG SỬA
                await axios.put(`${API_BASE_URL}/Products/${formData.id}`, submitData, { headers: getAuthHeaders() });
                alert("✅ Cập nhật sản phẩm thành công!");
            } else {
                // ĐANG THÊM MỚI
                await axios.post(`${API_BASE_URL}/Products`, submitData, { headers: getAuthHeaders() });
                alert("✅ Đã thêm sản phẩm mới!");
            }
            
            // Dọn dẹp form và load lại bảng
            setFormData(initialFormState);
            document.getElementById('imageUploader').value = ''; 
            fetchInitialData();

        } catch (error) {
            console.error("Lỗi khi lưu:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("❌ Lỗi quyền truy cập: Token đã hết hạn hoặc bạn không phải Admin!");
            } else {
                alert("❌ Lỗi hệ thống: Hãy kiểm tra console!");
            }
        }
    };

    // --- 6. XÓA SẢN PHẨM ---
    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            try {
                await axios.delete(`${API_BASE_URL}/Products/${id}`, { headers: getAuthHeaders() });
                alert("✅ Đã xóa thành công!");
                fetchInitialData(); // Load lại bảng
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("❌ Không thể xóa! Sản phẩm này có thể đã nằm trong Đơn hàng.");
            }
        }
    };

    // --- 7. TIỆN ÍCH ---
    const handleEditClick = (product) => {
        setFormData({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description || '',
            categoryId: product.categoryId || '',
            brandId: product.brandId || '',
            imageUrl: product.image || '', // Backend trả về trường `image`
            imageFile: null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-3xl font-bold text-slate-800">📦 Quản lý Sản Phẩm</h1>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full border border-green-300">
                    SaboTech System Active
                </span>
            </div>
            
            {/* --- FORM THÊM / SỬA --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <h2 className="text-xl font-bold mb-5 text-blue-700 flex items-center gap-2">
                    {formData.id ? '✏️ CẬP NHẬT THÔNG TIN' : '➕ THÊM SẢN PHẨM MỚI'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="md:col-span-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tên sản phẩm *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required 
                            className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Danh mục</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full border border-slate-300 p-2.5 rounded-lg outline-none">
                            <option value="">-- Chọn --</option>
                            {categories.length > 0 ? categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>) 
                            : <><option value="1">Laptop Gaming</option><option value="2">Linh kiện PC</option><option value="3">Phụ kiện</option></>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Thương hiệu</label>
                        <select name="brandId" value={formData.brandId} onChange={handleInputChange} className="w-full border border-slate-300 p-2.5 rounded-lg outline-none">
                            <option value="">-- Chọn --</option>
                            {brands.length > 0 ? brands.map(b => <option key={b.brandId} value={b.brandId}>{b.brandName}</option>)
                            : <><option value="1">ASUS</option><option value="2">Logitech</option><option value="3">Dell</option></>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Giá bán (VNĐ) *</label>
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} required 
                            className="w-full border border-slate-300 p-2.5 rounded-lg outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Số lượng kho *</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required 
                            className="w-full border border-slate-300 p-2.5 rounded-lg outline-none" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Hình ảnh sản phẩm</label>
                        <input type="file" id="imageUploader" accept="image/*" onChange={handleImageChange} 
                            className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                    
                    <div className="md:col-span-2 flex items-center">
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded shadow border" />
                        ) : <span className="text-sm text-slate-400 italic mt-6">Chưa có ảnh</span>}
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả chi tiết</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" 
                            className="w-full border border-slate-300 p-2.5 rounded-lg outline-none"></textarea>
                    </div>
                    
                    <div className="md:col-span-4 flex gap-3 mt-2 border-t pt-4">
                        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow transition">
                            {formData.id ? '💾 LƯU THAY ĐỔI' : '🚀 THÊM SẢN PHẨM'}
                        </button>
                        {formData.id && (
                            <button type="button" onClick={() => { setFormData(initialFormState); document.getElementById('imageUploader').value = ''; }} 
                            className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2.5 px-6 rounded-lg shadow transition">
                                ✖ HỦY BỎ
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-4 text-slate-800">📋 Danh sách Sản phẩm ({products.length})</h2>
                {loading ? <p className="text-center text-blue-500 font-semibold p-4">Đang tải dữ liệu từ Server...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-100 text-slate-600 border-b-2 border-slate-300">
                                    <th className="p-3">Hình ảnh</th>
                                    <th className="p-3">Tên sản phẩm</th>
                                    <th className="p-3">Phân loại</th>
                                    <th className="p-3">Giá bán</th>
                                    <th className="p-3 text-center">Kho</th>
                                    <th className="p-3 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="p-3">
                                            {p.image ? 
                                                <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded shadow-sm border" /> 
                                                : <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">Trống</div>
                                            }
                                        </td>
                                        <td className="p-3 font-semibold text-slate-800 max-w-xs truncate">{p.name}</td>
                                        <td className="p-3 text-sm text-slate-600">
                                            <p>{p.categoryName || 'Khác'}</p>
                                            <p className="text-xs text-slate-400 font-semibold">{p.brandName || 'Khác'}</p>
                                        </td>
                                        <td className="p-3 text-red-600 font-bold">{formatPrice(p.price)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {p.stock > 0 ? p.stock : 'Hết hàng'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center space-x-2">
                                            <button onClick={() => handleEditClick(p)} className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded text-sm font-semibold transition">Sửa</button>
                                            <button onClick={() => handleDelete(p.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded text-sm font-semibold transition">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductManager;