import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';
import { 
    FiCreditCard, FiSmartphone, FiDollarSign, FiBox, 
    FiShield, FiLoader, FiUser, FiMapPin, FiPhone, 
    FiX, FiCheckCircle 
} from 'react-icons/fi';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const checkoutItems = location.state?.checkoutItems || [];
    const totalAmount = location.state?.totalAmount || 0;
    const username = localStorage.getItem('username');

    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD'); 
    
    // State cho Thẻ Visa Test
    const [cardNumber, setCardNumber] = useState('');
    const [cardExp, setCardExp] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    
    const [profile, setProfile] = useState({ fullName: '', phone: '', address: '' });
    const [shippingAddress, setShippingAddress] = useState('');

    // State cho Modal QR
    const [showQRModal, setShowQRModal] = useState(false);
    const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (checkoutItems.length === 0 || !username) {
            navigate('/cart');
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5164/api/Accounts/profile/${username}`);
                setProfile(res.data);
                if (res.data.address) setShippingAddress(res.data.address);
            } catch (error) {
                console.error("Lỗi lấy thông tin", error);
            }
        };
        fetchProfile();
    }, [checkoutItems, navigate, username]);

    // 🔥 HÀM FORMAT SỐ THẺ TỰ ĐỘNG CÁCH SAU 4 SỐ
    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, ''); // Xóa mọi ký tự không phải là số
        val = val.substring(0, 16); // Giới hạn 16 số
        let parts = val.match(/.{1,4}/g) || []; // Chia thành các cụm 4 số
        setCardNumber(parts.join(' ')); // Nối lại bằng dấu cách
    };

    // 🔥 HÀM FORMAT NGÀY HẾT HẠN (TỰ ĐỘNG THÊM DẤU /)
    const handleExpChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.substring(0, 4);
        if (val.length >= 3) {
            setCardExp(`${val.substring(0, 2)}/${val.substring(2)}`);
        } else {
            setCardExp(val);
        }
    };

    // HÀM LƯU ĐƠN HÀNG VÀO C# 
    const submitOrderToBackend = async (paymentStatus, transactionId = null) => {
        try {
            const payload = {
                username: username,
                shippingAddress: shippingAddress,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                paymentStatus: paymentStatus,
                transactionId: transactionId,
                items: checkoutItems.map(item => ({
                    productId: item.id, 
                    quantity: item.quantity,
                    unitPrice: item.price 
                }))
            };

            await axios.post('http://localhost:5164/api/Orders/create', payload);

            // Dọn giỏ hàng
            const cartKey = `cart_${username}`;
            const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
            const purchasedIds = checkoutItems.map(item => item.id);
            const remainingCart = currentCart.filter(item => !purchasedIds.includes(item.id));
            localStorage.setItem(cartKey, JSON.stringify(remainingCart));
            window.dispatchEvent(new Event('storage'));

            showToast("Đặt hàng thành công!", "success");
            navigate('/my-orders');

        } catch (error) {
            showToast("Có lỗi xảy ra khi lưu đơn hàng!", "error");
            setLoading(false);
            setIsSimulatingPayment(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!profile.fullName || !profile.phone || !shippingAddress.trim()) {
            showToast("Vui lòng cập nhật đầy đủ Họ Tên, SĐT và Địa chỉ trước khi đặt hàng!", "error");
            navigate('/profile'); 
            return;
        }

        setLoading(true);

        if (paymentMethod === 'COD') {
            submitOrderToBackend('Chưa thanh toán');
        } 
        
        else if (paymentMethod === 'CARD') {
            const cleanCard = cardNumber.replace(/\s/g, '');
            if (cleanCard !== '4242424242424242') {
                showToast("Thẻ không hợp lệ! Vui lòng dùng thẻ Test 4242.", "error");
                setLoading(false);
                return;
            }
            if (!cardExp || !cardCvv) {
                showToast("Vui lòng nhập đầy đủ ngày hết hạn và CVV", "error");
                setLoading(false);
                return;
            }

            setTimeout(() => {
                const fakeTxId = "VISA_" + Math.random().toString(36).substring(2, 10).toUpperCase();
                submitOrderToBackend('Đã thanh toán', fakeTxId);
            }, 2000);
        }

        else if (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
            // Mở Modal Quét mã
            setShowQRModal(true);
            setLoading(false);
        }
    };

    // HÀM XỬ LÝ KHI QUÉT QR THÀNH CÔNG
    const handleQRScanSuccess = () => {
        setIsSimulatingPayment(true);
        setTimeout(() => {
            const fakeTxId = paymentMethod + "_" + Math.random().toString(36).substring(2, 10).toUpperCase();
            submitOrderToBackend('Đã thanh toán', fakeTxId);
        }, 2500);
    };

    if (checkoutItems.length === 0) return null;

    // 🔥 API TẠO MÃ QR THẬT CỦA VIETQR (ĐÚNG SỐ TIỀN VÀ THÔNG TIN SHOP)
    const vietQRUrl = `https://img.vietqr.io/image/mbbank-0123456789-compact2.png?amount=${totalAmount}&addInfo=SaboTech Order&accountName=SABOTECH STORE`;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-fadeIn min-h-screen">
            
            {/* CSS TIA LASER QUÉT MÃ */}
            <style>
                {`
                    @keyframes scan {
                        0% { top: 0; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                    .scanner-line {
                        animation: scan 2s linear infinite;
                    }
                `}
            </style>

            <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-3">
                <FiShield className="text-emerald-500" /> Thanh toán an toàn
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    {/* THÔNG TIN NHẬN HÀNG */}
                    <div className="space-y-4 mb-8">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4">Thông tin nhận hàng</h2>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Địa chỉ giao hàng chi tiết *</label>
                            <input 
                                type="text" 
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold transition-all text-slate-800" 
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4">Phương thức thanh toán</h2>
                    
                    <div className="space-y-4">
                        {/* COD */}
                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${paymentMethod === 'COD' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500'}`}><FiDollarSign /></div>
                                <div>
                                    <p className="font-bold text-slate-800">Thanh toán khi nhận hàng (COD)</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Tiền mặt khi giao hàng</p>
                                </div>
                            </div>
                            <input type="radio" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                        </label>

                        {/* MOMO */}
                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'MOMO' ? 'border-pink-500 bg-pink-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black tracking-tighter ${paymentMethod === 'MOMO' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-slate-100 text-slate-500'}`}>Mo</div>
                                <div>
                                    <p className="font-bold text-slate-800">Ví điện tử MoMo</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Quét mã QR qua ứng dụng MoMo</p>
                                </div>
                            </div>
                            <input type="radio" value="MOMO" checked={paymentMethod === 'MOMO'} onChange={() => setPaymentMethod('MOMO')} className="w-5 h-5 text-pink-500 focus:ring-pink-500" />
                        </label>

                        {/* VNPAY */}
                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${paymentMethod === 'VNPAY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-100 text-slate-500'}`}><FiSmartphone /></div>
                                <div>
                                    <p className="font-bold text-slate-800">Cổng thanh toán VNPay</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Quét mã qua App Ngân hàng</p>
                                </div>
                            </div>
                            <input type="radio" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} className="w-5 h-5 text-blue-600 focus:ring-blue-600" />
                        </label>

                        {/* CARD */}
                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${paymentMethod === 'CARD' ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/30' : 'bg-slate-100 text-slate-500'}`}><FiCreditCard /></div>
                                <div>
                                    <p className="font-bold text-slate-800">Thẻ Visa / Mastercard (Test)</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Dùng thẻ ảo: 4242 4242 4242 4242</p>
                                </div>
                            </div>
                            <input type="radio" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} className="w-5 h-5 text-slate-800 focus:ring-slate-800" />
                        </label>
                    </div>

                    {/* VÙNG NHẬP THẺ ẢO */}
                    {paymentMethod === 'CARD' && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-6 animate-slideUp">
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <FiCreditCard/> Nhập thông tin thẻ
                                </p>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Số thẻ (Nhập: 4242...)</label>
                                    <input 
                                        type="text" 
                                        value={cardNumber} 
                                        onChange={handleCardNumberChange} 
                                        placeholder="0000 0000 0000 0000" 
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold tracking-widest outline-none focus:border-slate-800 transition-all" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Ngày hết hạn</label>
                                        <input 
                                            type="text" 
                                            value={cardExp} 
                                            onChange={handleExpChange} 
                                            placeholder="MM/YY" 
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-center outline-none focus:border-slate-800 transition-all" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Mã bảo mật (CVV)</label>
                                        <input 
                                            type="password" 
                                            value={cardCvv} 
                                            onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))} 
                                            placeholder="•••" 
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-center tracking-[0.5em] outline-none focus:border-slate-800 transition-all" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CỘT PHẢI: CHI TIẾT ĐƠN HÀNG */}
                <div className="bg-slate-900 text-white p-8 rounded-[2rem] h-fit sticky top-28 shadow-2xl shadow-slate-900/20 border border-slate-800">
                    <h3 className="text-xl font-black mb-6 border-b border-slate-800 pb-4 flex items-center justify-between">
                        TỔNG KẾT ĐƠN HÀNG <FiBox className="text-blue-500" />
                    </h3>
                    
                    <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 mb-6">
                        <h4 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-3 flex items-center gap-2">
                            <FiMapPin className="text-blue-500" /> THÔNG TIN GIAO HÀNG
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm font-bold flex items-center gap-2">
                                <FiUser className="text-slate-500" /> {profile.fullName}
                            </p>
                            <p className="text-sm font-bold flex items-center gap-2">
                                <FiPhone className="text-slate-500" /> {profile.phone}
                            </p>
                            <div className="pt-2 mt-2 border-t border-slate-700/50 text-sm font-medium">
                                <span className="text-slate-400">Đ/c:</span> {shippingAddress}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {checkoutItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-slate-800/30 p-3 rounded-xl">
                                <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-white" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">SL: {item.quantity}</p>
                                </div>
                                <p className="font-black text-blue-400">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-800 pt-6 flex flex-col items-end mb-8">
                        <span className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] mb-1">Cần thanh toán</span>
                        <span className="text-4xl font-black text-emerald-400 leading-none">
                            {new Intl.NumberFormat('vi-VN').format(totalAmount)}đ
                        </span>
                    </div>

                    <button 
                        onClick={handleConfirmOrder}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-white transition-all shadow-xl shadow-blue-500/30 active:scale-95 disabled:opacity-70 disabled:cursor-wait uppercase tracking-widest"
                    >
                        {loading ? (
                            <><FiLoader className="animate-spin text-xl"/> ĐANG XỬ LÝ...</>
                        ) : paymentMethod === 'COD' ? (
                            'XÁC NHẬN ĐẶT HÀNG'
                        ) : paymentMethod === 'CARD' ? (
                            'THANH TOÁN QUA THẺ'
                        ) : (
                            `THANH TOÁN BẰNG ${paymentMethod}`
                        )}
                    </button>
                </div>
            </div>

            {/* ======================================= */}
            {/* MODAL MÃ QR THẬT (MOMO & VNPAY)           */}
            {/* ======================================= */}
            {showQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-slideUp overflow-hidden">
                        
                        {isSimulatingPayment ? (
                            <div className="text-center py-12">
                                <FiLoader className="animate-spin text-6xl text-blue-500 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-slate-800 mb-2">Đang xác nhận thanh toán...</h3>
                                <p className="text-slate-500 text-sm">Hệ thống đang kết nối với ngân hàng. <br/> Vui lòng không đóng trình duyệt!</p>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-full transition-colors z-10">
                                    <FiX className="text-2xl" />
                                </button>
                                
                                <div className="text-center mb-6 mt-2 relative z-10">
                                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl text-white font-black mb-4 shadow-lg ${paymentMethod === 'MOMO' ? 'bg-pink-500 shadow-pink-500/40' : 'bg-blue-600 shadow-blue-600/40'}`}>
                                        {paymentMethod === 'MOMO' ? 'Mo' : <FiSmartphone/>}
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800">Quét mã {paymentMethod}</h2>
                                    <p className="text-slate-500 text-sm mt-1">Mở App Ngân hàng hoặc {paymentMethod} để quét mã</p>
                                </div>

                                <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-6 mb-4 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                                    {/* HIỆU ỨNG TIA LASER QUÉT MÃ */}
                                    <div className="absolute left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_3px_#4ade80] scanner-line z-20 opacity-80 rounded-full"></div>
                                    
                                    <img src={vietQRUrl} alt="VietQR Code" className="w-56 h-auto rounded-xl relative z-10 mix-blend-multiply" />
                                    
                                    <p className="text-slate-800 font-bold mt-4 text-center">SABOTECH STORE</p>
                                    <p className="text-blue-600 font-black text-2xl">{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</p>
                                </div>

                                <div className="text-center relative z-10">
                                    <div className="bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold p-3 rounded-xl mb-4 flex gap-2 text-left">
                                        <span className="text-lg">⚠️</span>
                                        Vui lòng không tắt bảng này cho đến khi bạn chuyển khoản thành công!
                                    </div>
                                    
                                    <button 
                                        onClick={handleQRScanSuccess}
                                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                                    >
                                        <FiCheckCircle className="text-lg"/> DEMO: ĐÃ CHUYỂN KHOẢN XONG
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;