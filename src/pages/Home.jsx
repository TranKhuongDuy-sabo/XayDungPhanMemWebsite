import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../components/Toast';
import { 
    FiTruck, FiShield, FiHeadphones, FiCreditCard, 
    FiChevronRight, FiChevronLeft, FiMonitor, FiCpu, FiMousePointer 
} from 'react-icons/fi';

const Home = () => {
    const API_BASE_URL = 'http://localhost:5164/api';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentBanner, setCurrentBanner] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();

    // --- DATA BANNER TỰ ĐỘNG CHUYỂN ---
    const banners = [
        {
            id: 1,
            tag: "SaboTech Gaming Hub",
            title: "Nâng Tầm Trải Nghiệm",
            highlight: "Chiến Game Đỉnh Cao",
            desc: "Chuyên cung cấp linh kiện PC, Laptop Gaming cho sinh viên.",
            bg: "bg-slate-900",
            glow: "bg-blue-600/20",
            icon: "💻"
        },
        {
            id: 2,
            tag: "Sale Tới Bến",
            title: "Gaming Gear Xịn",
            highlight: "Giá Cực Sinh Viên",
            desc: "Bàn phím cơ, chuột gaming chuẩn E-sport giảm đến 30%.",
            bg: "bg-indigo-900",
            glow: "bg-purple-600/20",
            icon: "🎧"
        },
        {
            id: 3,
            tag: "Build PC Tiết Kiệm",
            title: "Linh Kiện Chính Hãng",
            highlight: "Bảo Hành Tận Răng",
            desc: "Hỗ trợ lắp đặt và cài Win miễn phí tại cửa hàng.",
            bg: "bg-slate-900",
            glow: "bg-emerald-600/20",
            icon: "⚙️"
        }
    ];

    // Auto chuyển banner mỗi 5 giây
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        if (location.state?.loginSuccess) {
            const username = localStorage.getItem('username');
            showToast(`Đăng nhập thành công! Chào mừng ${username}`, 'success');
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const getCartKey = () => {
        const username = localStorage.getItem('username');
        return username ? `cart_${username}` : 'cart_guest';
    };

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/Products`);

                const activeProducts = res.data.filter(p =>
                    (p.isActive === true || p.isActive === "true") &&
                    (p.categoryIsActive === true || p.categoryIsActive === "true")
                );

                let featuredProducts = activeProducts.filter(p =>
                    p.isFeatured === true || p.isFeatured === "true" || p.isFeatured === "True"
                );

                if (featuredProducts.length === 0) {
                    featuredProducts = activeProducts;
                }

                setProducts(featuredProducts.slice(0, 8));

            } catch (error) {
                console.error("Lỗi lấy sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedProducts();
    }, []);

    const addToCart = (product) => {
        const username = localStorage.getItem('username');

        if (!username) {
            showToast("Vui lòng đăng nhập để mua hàng!", "error");
            navigate('/login');
            return;
        }

        const cartKey = `cart_${username}`;
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

        const actualId = product.productId || product.id;
        const index = cart.findIndex(item => item.id === actualId);

        if (index > -1) {
            cart[index].quantity += 1;
        } else {
            cart.push({
                id: actualId,
                name: product.productName || product.name,
                price: product.price,
                image: product.image || product.imageUrl,
                quantity: 1
            });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));

        showToast(`Đã thêm "${product.productName || product.name}" vào giỏ hàng!`, 'success');
    };

    return (
        <div className="animate-fadeIn p-4 md:p-0 min-h-screen">
            
            {/* --- HERO SECTION (AUTO SLIDER) --- */}
            <section className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl h-[450px] md:h-[500px] group">
                {banners.map((banner, index) => (
                    <div 
                        key={banner.id} 
                        className={`absolute inset-0 w-full h-full ${banner.bg} transition-opacity duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <div className={`absolute top-0 right-0 w-1/2 h-full ${banner.glow} blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 transition-all duration-1000`}></div>
                        <div className="relative h-full px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="max-w-xl space-y-6 text-center md:text-left pt-12 md:pt-0">
                                <span className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase backdrop-blur-md">
                                    {banner.tag}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                                    {banner.title} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{banner.highlight}</span>
                                </h1>
                                <p className="text-slate-400 text-lg hidden md:block">{banner.desc}</p>
                                <Link to="/products" className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95">
                                    KHÁM PHÁ NGAY
                                </Link>
                            </div>
                            <div className="text-[120px] md:text-[250px] drop-shadow-2xl animate-bounce-slow pb-10 md:pb-0 select-none">
                                {banner.icon}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Nút điều hướng Slider */}
                <button onClick={() => setCurrentBanner(prev => prev === 0 ? banners.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <FiChevronLeft className="text-2xl" />
                </button>
                <button onClick={() => setCurrentBanner(prev => prev === banners.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <FiChevronRight className="text-2xl" />
                </button>
                
                {/* Dấu chấm điều hướng */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {banners.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentBanner(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === currentBanner ? 'bg-blue-500 w-8' : 'bg-white/30 hover:bg-white/50'}`}></button>
                    ))}
                </div>
            </section>

            {/* --- TRUST BADGES (CAM KẾT) --- */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-200 transition-colors">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform"><FiTruck /></div>
                    <h4 className="font-black text-slate-800 text-sm">Giao Hàng Siêu Tốc</h4>
                    <p className="text-xs text-slate-500 mt-1">Hỏa tốc 2h nội thành</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 transition-colors">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform"><FiShield /></div>
                    <h4 className="font-black text-slate-800 text-sm">Bảo Hành Chính Hãng</h4>
                    <p className="text-xs text-slate-500 mt-1">Cam kết 1 đổi 1</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-amber-200 transition-colors">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform"><FiCreditCard /></div>
                    <h4 className="font-black text-slate-800 text-sm">Thanh Toán An Toàn</h4>
                    <p className="text-xs text-slate-500 mt-1">Hỗ trợ trả góp 0%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-violet-200 transition-colors">
                    <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform"><FiHeadphones /></div>
                    <h4 className="font-black text-slate-800 text-sm">Hỗ Trợ 24/7</h4>
                    <p className="text-xs text-slate-500 mt-1">Đội ngũ kỹ thuật tận tâm</p>
                </div>
            </section>

            {/* --- DANH MỤC NỔI BẬT --- */}
            <section className="mb-16">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center mb-8 uppercase">Mua sắm theo danh mục</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/products" className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group hover:shadow-xl hover:shadow-slate-900/20 transition-all">
                        <div className="relative z-10">
                            <FiMonitor className="text-4xl text-blue-400 mb-4 group-hover:scale-110 transition-transform origin-left" />
                            <h3 className="text-2xl font-black mb-1">Laptop & PC</h3>
                            <p className="text-slate-400 text-sm font-medium">Sẵn sàng chiến mọi tựa game</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-colors"></div>
                    </Link>
                    <Link to="/products" className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-900/20 transition-all">
                        <div className="relative z-10">
                            <FiMousePointer className="text-4xl text-purple-400 mb-4 group-hover:scale-110 transition-transform origin-left" />
                            <h3 className="text-2xl font-black mb-1">Gaming Gear</h3>
                            <p className="text-indigo-200 text-sm font-medium">Chuột, phím, tai nghe xịn xò</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/40 transition-colors"></div>
                    </Link>
                    <Link to="/products" className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-900/20 transition-all">
                        <div className="relative z-10">
                            <FiCpu className="text-4xl text-emerald-400 mb-4 group-hover:scale-110 transition-transform origin-left" />
                            <h3 className="text-2xl font-black mb-1">Linh kiện PC</h3>
                            <p className="text-emerald-200 text-sm font-medium">VGA, RAM, SSD tốc độ cao</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/40 transition-colors"></div>
                    </Link>
                </div>
            </section>

            {/* --- PRODUCTS SECTION --- */}
            <section className="mb-20">
                <div className="flex items-end justify-between mb-8 border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Sản phẩm nổi bật</h2>
                        <p className="text-slate-500 font-medium mt-1">Những lựa chọn hàng đầu từ SaboTech</p>
                    </div>
                    <Link to="/products" className="text-blue-600 font-bold hover:text-blue-800 transition-colors hidden md:block">Xem tất cả kho hàng →</Link>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-bold animate-pulse italic">Đang tải dữ liệu SaboTech...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <div key={p.id} className="group bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
                                <div className="relative">
                                    <span className={`absolute top-2 left-2 z-10 px-2 py-1 text-white text-[10px] font-black rounded uppercase tracking-wider shadow-sm ${p.stock < 5 ? 'bg-red-500' : 'bg-blue-600'}`}>
                                        {p.stock < 5 ? 'Sắp hết' : 'Mới'}
                                    </span>
                                    <div className="bg-slate-50 aspect-square rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500 overflow-hidden p-4">
                                        <img
                                            src={p.image || 'https://via.placeholder.com/300'}
                                            alt={p.name}
                                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/300'}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-700 h-10 overflow-hidden line-clamp-2 leading-tight flex-1">{p.name}</h3>
                                    <div className="flex items-end justify-between pt-2">
                                        <p className="text-xl font-black text-red-600">{new Intl.NumberFormat('vi-VN').format(p.price)}đ</p>
                                    </div>
                                    <button
                                        onClick={() => addToCart(p)}
                                        className="w-full bg-slate-900 text-white py-3 mt-3 rounded-xl font-black uppercase text-sm translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 shadow-xl shadow-blue-600/20"
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="text-center mt-8 md:hidden">
                    <Link to="/products" className="inline-block px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Xem tất cả kho hàng</Link>
                </div>
            </section>

            {/* --- VỀ CHÚNG TÔI (ABOUT SABOTECH) --- */}
            <section className="bg-slate-900 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
                <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                    <span className="text-blue-500 font-black tracking-widest uppercase text-sm mb-4">Về SaboTech Store</span>
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-6">
                        Đồng hành cùng đam mê công nghệ của sinh viên.
                    </h2>
                    <p className="text-slate-400 leading-relaxed mb-8 font-medium">
                        SaboTech được sinh ra với sứ mệnh mang đến những thiết bị PC, Laptop và Gaming Gear chất lượng nhất với mức giá tối ưu nhất dành riêng cho các bạn sinh viên. Chúng tôi không chỉ bán sản phẩm, chúng tôi mang đến giải pháp tối đa hóa hiệu suất học tập và giải trí của bạn.
                    </p>
                    <Link to="/contact" className="w-fit text-white font-bold border-b-2 border-blue-600 hover:text-blue-500 hover:border-blue-400 transition-colors pb-1">
                        Liên hệ với chúng tôi
                    </Link>
                </div>
                <div className="md:w-1/2 bg-slate-800 relative min-h-[300px]">
                    {/* Fake image cover using gradient for now, can be replaced with a real store image */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 to-transparent z-10"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1000&auto=format&fit=crop" 
                        alt="SaboTech Workspace" 
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
                    />
                </div>
            </section>

        </div>
    );
};

export default Home;