import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    // --- 1. CẤU HÌNH API ---
    const API_BASE_URL = 'http://localhost:5164/api';

    // --- 2. STATE ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 3. FETCH DỮ LIỆU THẬT ---
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                // Gọi API lấy danh sách sản phẩm
                const res = await axios.get(`${API_BASE_URL}/Products`);
                // Duy lấy khoảng 8 cái mới nhất để hiện trang chủ cho đẹp nhé
                setProducts(res.data.slice(0, 8));
            } catch (error) {
                console.error("Lỗi lấy sản phẩm trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedProducts();
    }, []);

    // --- 4. LOGIC THÊM VÀO GIỎ HÀNG (DÙNG LOCALSTORAGE) ---
    const addToCart = (product) => {
        // Lấy giỏ hàng hiện tại hoặc mảng rỗng nếu chưa có
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const index = cart.findIndex(item => item.id === product.id);
        
        if (index > -1) {
            // Nếu có rồi thì tăng số lượng
            cart[index].quantity += 1;
        } else {
            // Nếu chưa có thì thêm mới với số lượng là 1
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        // Lưu lại vào máy người dùng
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Bắn sự kiện để cái số Badge trên Header tự cập nhật
        window.dispatchEvent(new Event('storage'));
        
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    return (
        <div className="animate-fadeIn p-4 md:p-0">
            {/* --- HERO SECTION --- */}
            <section className="relative overflow-hidden bg-slate-900 rounded-3xl mb-12 shadow-2xl shadow-blue-200">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="relative px-8 py-16 md:px-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl space-y-6 text-center md:text-left">
                        <span className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase">
                            SaboTech Gaming Hub
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            Nâng Tầm Trải Nghiệm <br/> 
                            <span className="text-blue-500">Chiến Game Đỉnh Cao</span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Chuyên cung cấp linh kiện PC, Laptop Gaming chính hãng cho sinh viên STU.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <Link to="/products" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                                MUA SẮM NGAY
                            </Link>
                        </div>
                    </div>
                    
                    <div className="text-[180px] md:text-[250px] drop-shadow-2xl animate-bounce-slow">
                        💻
                    </div>
                </div>
            </section>

            {/* --- FEATURED PRODUCTS: DỮ LIỆU TỪ DATABASE --- */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Sản phẩm nổi bật</h2>
                        <div className="w-20 h-1.5 bg-blue-600 mt-2 rounded-full"></div>
                    </div>
                    <Link to="/products" className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-2">
                        Xem tất cả <span>→</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-bold animate-pulse">
                        Đang kết nối dữ liệu SaboTech...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((p) => (
                            <div key={p.id} className="group bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-2xl transition-all duration-300 relative flex flex-col justify-between h-full">
                                {/* Tag thông minh */}
                                <span className={`absolute top-4 left-4 z-10 px-2 py-1 text-white text-[10px] font-bold rounded uppercase ${p.stock < 5 ? 'bg-orange-500' : 'bg-red-500'}`}>
                                    {p.stock < 5 ? 'Sắp hết' : 'Mới'}
                                </span>
                                
                                {/* Ảnh sản phẩm thật */}
                                <div className="bg-slate-50 aspect-square rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500 overflow-hidden border border-slate-50">
                                    <img 
                                        src={p.image || 'https://via.placeholder.com/300'} 
                                        alt={p.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/300'}
                                    />
                                </div>

                                {/* Info */}
                                <div className="space-y-2 text-center">
                                    <h3 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors h-12 overflow-hidden line-clamp-2">
                                        {p.name}
                                    </h3>
                                    <p className="text-2xl font-black text-slate-900">
                                        {new Intl.NumberFormat('vi-VN').format(p.price)}đ
                                    </p>
                                    <button 
                                        onClick={() => addToCart(p)}
                                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 active:scale-95 shadow-lg shadow-blue-100"
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* --- PROMO BANNERS --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-10 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-2 text-white">Linh Kiện PC</h3>
                        <p className="text-blue-100 mb-6">Build PC cực chất, bảo hành cực lâu</p>
                        <Link to="/products" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold text-sm">XEM NGAY</Link>
                    </div>
                    <div className="absolute -right-5 -bottom-5 text-9xl opacity-20 group-hover:rotate-12 transition-transform">⚙️</div>
                </div>
                
                <div className="bg-slate-800 rounded-3xl p-10 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-2 text-white">Gaming Gear</h3>
                        <p className="text-slate-400 mb-6">Combo chuột phím tai nghe giá sinh viên</p>
                        <Link to="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm">KHÁM PHÁ</Link>
                    </div>
                    <div className="absolute -right-5 -bottom-5 text-9xl opacity-20 group-hover:rotate-12 transition-transform">🎧</div>
                </div>
            </section>
        </div>
    );
};

export default Home;