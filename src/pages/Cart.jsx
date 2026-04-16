import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);

    // --- 🔥 HÀM LẤY KEY GIỎ HÀNG RIÊNG BIỆT (Giống bên Home.jsx) ---
    const getCartKey = () => {
        const username = localStorage.getItem('username');
        return username ? `cart_${username}` : 'cart_guest';
    };

    // 1. Load giỏ hàng từ LocalStorage khi vào trang
    useEffect(() => {
        const cartKey = getCartKey();
        const savedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
        setCartItems(savedCart);
    }, []);

    // 2. Hàm thay đổi số lượng
    const updateQuantity = (id, delta) => {
        const newCart = cartItems.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        
        setCartItems(newCart);
        // 🔥 Lưu vào đúng key của người dùng
        localStorage.setItem(getCartKey(), JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage')); 
    };

    // 3. Hàm xóa sản phẩm
    const removeItem = (id) => {
        const newCart = cartItems.filter(item => item.id !== id);
        
        setCartItems(newCart);
        // 🔥 Lưu vào đúng key của người dùng
        localStorage.setItem(getCartKey(), JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage'));
    };

    // 4. Tính toán tổng tiền
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 30000 : 0;
    const total = subtotal + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                <div className="text-8xl">🛒</div>
                <h2 className="text-2xl font-bold text-slate-400">Giỏ hàng của bạn đang trống</h2>
                <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                    TIẾP TỤC MUA SẮM
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Giỏ hàng của bạn</h1>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase">
                    {localStorage.getItem('username') || 'Khách'}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DANH SÁCH SẢN PHẨM */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group">
                            <img 
                                src={item.image || 'https://via.placeholder.com/80'} 
                                alt={item.name} 
                                className="w-20 h-20 object-cover rounded-xl border border-slate-50" 
                                onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                            />
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                <p className="text-blue-600 font-black mt-1">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</p>
                            </div>
                            
                            {/* Bộ tăng giảm số lượng */}
                            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white hover:shadow-sm rounded-lg transition-all">-</button>
                                <span className="w-10 text-center font-black text-sm text-slate-700">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white hover:shadow-sm rounded-lg transition-all">+</button>
                            </div>

                            <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 p-2 text-xl transition-colors">
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>

                {/* TỔNG KẾT ĐƠN HÀNG */}
                <div className="bg-slate-900 text-white p-8 rounded-[2rem] h-fit sticky top-24 shadow-2xl shadow-blue-100 border border-slate-800">
                    <h3 className="text-xl font-black mb-6 border-b border-slate-800 pb-4 italic tracking-widest">THANH TOÁN</h3>
                    <div className="space-y-4 text-sm font-medium">
                        <div className="flex justify-between">
                            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Tạm tính:</span>
                            <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Phí vận chuyển:</span>
                            <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(shipping)}đ</span>
                        </div>
                        <div className="border-t border-slate-800 pt-6 flex justify-between items-end">
                            <span className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">Tổng tiền</span>
                            <span className="text-3xl font-black text-blue-500 leading-none">
                                {new Intl.NumberFormat('vi-VN').format(total)}đ
                            </span>
                        </div>
                    </div>
                    
                    <button className="w-full mt-10 bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-blue-500/20 uppercase tracking-widest text-sm">
                        ĐẶT HÀNG NGAY
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <p className="text-[9px] text-center uppercase font-bold tracking-[0.3em]">
                            SaboTech Security
                        </p>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;