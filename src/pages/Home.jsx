import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const API_BASE_URL = 'http://localhost:5164/api';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 🔥 BƯỚC 1: HÀM LẤY KEY GIỎ HÀNG RIÊNG BIỆT ---
    const getCartKey = () => {
        const username = localStorage.getItem('username');
        // Nếu đã đăng nhập thì dùng 'cart_tendangnhap', chưa thì dùng 'cart_guest'
        return username ? `cart_${username}` : 'cart_guest';
    };

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/Products`);
                setProducts(res.data.slice(0, 8));
            } catch (error) {
                console.error("Lỗi lấy sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedProducts();
    }, []);

    // --- 🔥 BƯỚC 2: CẬP NHẬT LOGIC THÊM GIỎ HÀNG ---
    const addToCart = (product) => {
        const cartKey = getCartKey(); // Lấy key của người dùng hiện tại
        
        // Lấy đúng giỏ hàng của người đó
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        const index = cart.findIndex(item => item.id === product.id);
        
        if (index > -1) {
            cart[index].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        // Lưu lại vào đúng Key riêng biệt
        localStorage.setItem(cartKey, JSON.stringify(cart));
        
        // Bắn sự kiện để Header (cũng phải dùng getCartKey) nhảy số
        window.dispatchEvent(new Event('storage'));
        
        alert(`Đã thêm vào giỏ hàng của ${localStorage.getItem('username') || 'khách'}!`);
    };

    return (
        <div className="animate-fadeIn p-4 md:p-0">
            {/* --- HERO SECTION --- */}
            <section className="relative overflow-hidden bg-slate-900 rounded-3xl mb-12 shadow-2xl shadow-blue-200">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative px-8 py-16 md:px-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl space-y-6 text-center md:text-left">
                        <span className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase">SaboTech Gaming Hub</span>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            Nâng Tầm Trải Nghiệm <br/> 
                            <span className="text-blue-500">Chiến Game Đỉnh Cao</span>
                        </h1>
                        <p className="text-slate-400 text-lg">Chuyên cung cấp linh kiện PC, Laptop Gaming cho sinh viên STU.</p>
                        <Link to="/products" className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">MUA SẮM NGAY</Link>
                    </div>
                    <div className="text-[180px] md:text-[250px] drop-shadow-2xl animate-bounce-slow">💻</div>
                </div>
            </section>

            {/* --- PRODUCTS SECTION --- */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Sản phẩm nổi bật</h2>
                        <div className="w-20 h-1.5 bg-blue-600 mt-2 rounded-full"></div>
                    </div>
                    <Link to="/products" className="text-blue-600 font-bold hover:underline">Xem tất cả →</Link>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-bold animate-pulse italic">Đang tải dữ liệu SaboTech...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((p) => (
                            <div key={p.id} className="group bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                                <div className="relative">
                                    <span className={`absolute top-0 left-0 z-10 px-2 py-1 text-white text-[10px] font-bold rounded uppercase ${p.stock < 5 ? 'bg-orange-500' : 'bg-blue-600'}`}>
                                        {p.stock < 5 ? 'Sắp hết' : 'Mới'}
                                    </span>
                                    <div className="bg-slate-50 aspect-square rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                        <img 
                                            src={p.image || 'https://via.placeholder.com/300'} 
                                            alt={p.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/300'}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 text-center">
                                    <h3 className="font-bold text-slate-700 h-12 overflow-hidden line-clamp-2 leading-tight">{p.name}</h3>
                                    <p className="text-2xl font-black text-slate-900">{new Intl.NumberFormat('vi-VN').format(p.price)}đ</p>
                                    <button 
                                        onClick={() => addToCart(p)}
                                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 shadow-xl"
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* --- FOOTER BANNERS --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-10 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-2">Linh Kiện PC</h3>
                        <p className="text-blue-100 mb-6 italic">Cấu hình cực mạnh cho sinh viên IT</p>
                        <Link to="/products" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold text-sm">XEM NGAY</Link>
                    </div>
                    <div className="absolute -right-5 -bottom-5 text-9xl opacity-20 group-hover:rotate-12 transition-transform">⚙️</div>
                </div>
                <div className="bg-slate-800 rounded-3xl p-10 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-2">Gaming Gear</h3>
                        <p className="text-slate-400 mb-6 italic">Full bộ chuột phím cơ giá STU</p>
                        <Link to="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm">KHÁM PHÁ</Link>
                    </div>
                    <div className="absolute -right-5 -bottom-5 text-9xl opacity-20 group-hover:rotate-12 transition-transform">🎧</div>
                </div>
            </section>
        </div>
    );
};

export default Home;