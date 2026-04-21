import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { showToast } from '../components/Toast';
import { FiTrash2, FiShoppingCart, FiMinus, FiPlus, FiChevronRight, FiCheck } from 'react-icons/fi';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); 
    const navigate = useNavigate();

    const getCartKey = () => {
        const username = localStorage.getItem('username');
        return username ? `cart_${username}` : 'cart_guest';
    };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        const cartKey = getCartKey();
        const savedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
        setCartItems(savedCart);
    }, []);

    const updateQuantity = (id, delta) => {
        const newCart = cartItems.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        });
        setCartItems(newCart);
        localStorage.setItem(getCartKey(), JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage')); 
    };

    const removeItem = (id) => {
        const newCart = cartItems.filter(item => item.id !== id);
        setCartItems(newCart);
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        localStorage.setItem(getCartKey(), JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage'));
    };

    const toggleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]); 
        } else {
            setSelectedItems(cartItems.map(item => item.id)); 
        }
    };

    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
    const subtotal = selectedCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 30000 : 0;
    const total = subtotal + shipping;

    // 🔥 HÀM MỚI: KIỂM TRA THÔNG TIN TRƯỚC KHI CHECKOUT
    const handleCheckout = async () => {
        if (selectedItems.length === 0) {
            showToast("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!", "error");
            return;
        }

        const username = localStorage.getItem('username');
        if (!username) {
            showToast("Vui lòng đăng nhập để mua hàng!", "error");
            navigate('/login');
            return;
        }

        try {
            // Gọi API lấy thông tin Profile của User
            const res = await axios.get(`http://localhost:5164/api/Accounts/profile/${username}`);
            const profile = res.data;

            // Kiểm tra nếu thiếu 1 trong 3 thông tin quan trọng
            if (!profile.fullName || !profile.phone || !profile.address) {
                showToast("Vui lòng cập nhật đầy đủ Họ tên, SĐT và Địa chỉ trước khi đặt hàng!", "error");
                navigate('/profile'); // Đá về trang Profile bắt điền
                return;
            }

            // Đã đủ thông tin -> Sang Checkout và MANG THEO ĐỊA CHỈ điền sẵn
            navigate('/checkout', { 
                state: { 
                    checkoutItems: selectedCartItems, 
                    totalAmount: total,
                    userAddress: profile.address // 🔥 Truyền địa chỉ qua đây
                } 
            });

        } catch (error) {
            console.error("Lỗi kiểm tra thông tin:", error);
            showToast("Lỗi xác minh tài khoản. Vui lòng thử lại sau!", "error");
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                <FiShoppingCart className="text-8xl text-slate-200" />
                <h2 className="text-2xl font-bold text-slate-400">Giỏ hàng của bạn đang trống</h2>
                <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-4">
                    TIẾP TỤC MUA SẮM
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fadeIn min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                    <FiShoppingCart className="text-blue-600" /> Giỏ hàng của bạn
                </h1>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase">
                    {localStorage.getItem('username') || 'Khách'}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DANH SÁCH SẢN PHẨM */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
                        <input 
                            type="checkbox" 
                            checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                            onChange={toggleSelectAll}
                            className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="font-bold text-slate-700">Chọn tất cả ({cartItems.length} sản phẩm)</span>
                    </div>

                    {cartItems.map(item => (
                        <div key={item.id} className={`bg-white p-4 rounded-2xl border flex items-center gap-4 transition-all group ${selectedItems.includes(item.id) ? 'border-blue-300 shadow-md ring-1 ring-blue-50' : 'border-slate-100 shadow-sm'}`}>
                            <input 
                                type="checkbox" 
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleSelectItem(item.id)}
                                className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer ml-1"
                            />
                            
                            <img 
                                src={item.image || 'https://via.placeholder.com/80'} 
                                alt={item.name} 
                                className="w-20 h-20 object-cover rounded-xl border border-slate-50" 
                                onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                            />
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{item.name}</h3>
                                <p className="text-blue-600 font-black mt-1">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</p>
                            </div>
                            
                            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm rounded-lg transition-all"><FiMinus/></button>
                                <span className="w-8 text-center font-black text-sm text-slate-700">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm rounded-lg transition-all"><FiPlus/></button>
                            </div>

                            <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 p-3 transition-colors" title="Xóa sản phẩm">
                                <FiTrash2 className="text-xl" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* TỔNG KẾT ĐƠN HÀNG */}
                <div className="bg-slate-900 text-white p-8 rounded-[2rem] h-fit sticky top-28 shadow-2xl shadow-blue-100/10 border border-slate-800">
                    <h3 className="text-xl font-black mb-6 border-b border-slate-800 pb-4 italic tracking-widest">TẠM TÍNH</h3>
                    <div className="space-y-4 text-sm font-medium mb-6">
                        <div className="flex justify-between">
                            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Sản phẩm chọn:</span>
                            <span className="font-bold text-blue-400">{selectedItems.length} món</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Tạm tính:</span>
                            <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Phí vận chuyển:</span>
                            <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(shipping)}đ</span>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-800 pt-6 flex flex-col items-end mb-8">
                        <span className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] mb-1">Tổng thanh toán</span>
                        <span className="text-3xl font-black text-blue-500 leading-none">
                            {new Intl.NumberFormat('vi-VN').format(total)}đ
                        </span>
                    </div>
                    
                    <button 
                        onClick={handleCheckout}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all shadow-xl uppercase tracking-widest text-sm
                            ${selectedItems.length > 0 
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 active:scale-95 text-white' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                    >
                        MUA HÀNG <FiChevronRight className="text-xl" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;