import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);

    // 1. Load giỏ hàng từ LocalStorage khi vào trang
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
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
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage')); // Thông báo cho Header cập nhật số badge
    };

    // 3. Hàm xóa sản phẩm
    const removeItem = (id) => {
        const newCart = cartItems.filter(item => item.id !== id);
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage'));
    };

    // 4. Tính toán tổng tiền
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 30000 : 0;
    const total = subtotal + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="text-8xl">🛒</div>
                <h2 className="text-2xl font-bold text-slate-400">Giỏ hàng của bạn đang trống</h2>
                <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                    TIẾP TỤC MUA SẮM
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fadeIn">
            <h1 className="text-3xl font-black text-slate-800 mb-8 uppercase">Giỏ hàng của bạn</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DANH SÁCH SẢN PHẨM */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl border" />
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 leading-tight">{item.name}</h3>
                                <p className="text-blue-600 font-black">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</p>
                            </div>
                            
                            {/* Bộ tăng giảm số lượng */}
                            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white rounded-md transition-all">-</button>
                                <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white rounded-md transition-all">+</button>
                            </div>

                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-2 text-xl">
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>

                {/* TỔNG KẾT ĐƠN HÀNG */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl h-fit sticky top-24 shadow-2xl shadow-blue-200">
                    <h3 className="text-xl font-black mb-6 border-b border-slate-700 pb-4">Tóm tắt đơn hàng</h3>
                    <div className="space-y-4 text-sm font-medium">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Tạm tính:</span>
                            <span>{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Phí vận chuyển:</span>
                            <span>{new Intl.NumberFormat('vi-VN').format(shipping)}đ</span>
                        </div>
                        <div className="border-t border-slate-700 pt-4 flex justify-between text-xl font-black">
                            <span>Tổng cộng:</span>
                            <span className="text-blue-500">{new Intl.NumberFormat('vi-VN').format(total)}đ</span>
                        </div>
                    </div>
                    
                    <button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                        THANH TOÁN NGAY
                    </button>
                    
                    <p className="text-[10px] text-center text-slate-500 mt-4 uppercase font-bold tracking-widest">
                        SaboTech cam kết bảo mật thông tin
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Cart;