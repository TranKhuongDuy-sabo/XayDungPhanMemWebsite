import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FiBox, FiFilter, FiShoppingBag, FiChevronDown, FiChevronUp, 
    FiMapPin, FiCreditCard, FiCheckCircle, FiTrash2, FiLoader, FiAlertTriangle 
} from 'react-icons/fi';
import { showToast } from '../components/Toast';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    
    // 🔥 State mới để điều khiển Modal xác nhận hủy
    const [confirmModal, setConfirmModal] = useState(null); 

    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const tabs = ['Tất cả', 'Mới', 'Đang giao', 'Đã giao', 'Đã hủy'];

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (!username) {
            navigate('/login');
            return;
        }
        fetchMyOrders();
    }, [username, navigate]);

    const fetchMyOrders = async () => {
        try {
            const res = await axios.get(`http://localhost:5164/api/Orders/user/${username}`);
            setOrders(res.data);
        } catch (error) {
            showToast("Không thể tải lịch sử mua hàng!", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 HÀM THỰC THI HỦY (Được gọi từ Modal Xác nhận)
    const executeCancelOrder = async () => {
        const orderId = confirmModal;
        setCancellingOrderId(orderId);
        setConfirmModal(null); // Đóng Modal ngay lập tức để hiện loading trên nút

        try {
            await axios.put(`http://localhost:5164/api/Orders/cancel-order/${orderId}`, {
                username: username
            });

            showToast(`Hủy đơn hàng #${orderId} thành công!`, "success");
            
            setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: 'Đã hủy' } : o));
            setExpandedOrder(null); 

        } catch (error) {
            const msg = error.response?.data || "Hủy đơn hàng thất bại!";
            showToast(msg, "error");
        } finally {
            setCancellingOrderId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Mới': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Đang giao': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'Đã giao': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'Đã hủy': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const toggleOrderDetails = (orderId) => {
        if (expandedOrder === orderId) setExpandedOrder(null); 
        else setExpandedOrder(orderId);
    };

    const filteredOrders = activeTab === 'Tất cả' ? orders : orders.filter(o => o.status === activeTab);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-fadeIn min-h-screen">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-3">
                <FiBox className="text-blue-600" /> Lịch sử mua hàng
            </h1>

            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-4 mb-6">
                <div className="flex items-center justify-center p-3 bg-white border border-slate-200 rounded-xl text-slate-400">
                    <FiFilter />
                </div>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setExpandedOrder(null); }} 
                        className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold transition-all ${
                            activeTab === tab 
                                ? 'bg-slate-900 text-white shadow-lg' 
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {tab === 'Mới' ? 'ĐANG XỬ LÝ' : tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-20 animate-pulse font-bold text-slate-400">Đang tải dữ liệu...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center">
                        <FiShoppingBag className="text-6xl text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold mb-6">Bạn chưa có đơn hàng nào trong mục này.</p>
                        <Link to="/products" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                            MUA SẮM NGAY
                        </Link>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.orderId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-300 relative">
                            
                            <div 
                                onClick={() => toggleOrderDetails(order.orderId)}
                                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400">
                                        <FiBox className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg">Đơn hàng #{order.orderId}</h3>
                                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                                            {new Date(order.orderDate).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 border-slate-100">
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-0.5">Tổng tiền</p>
                                        <p className="font-black text-blue-600 text-lg">{new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </div>
                                        <div className={`p-2 rounded-full transition-colors ${expandedOrder === order.orderId ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {expandedOrder === order.orderId ? <FiChevronUp className="text-xl" /> : <FiChevronDown className="text-xl" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {expandedOrder === order.orderId && (
                                <div className="bg-slate-50 border-t border-slate-200 animate-fadeIn">
                                    <div className="p-5 md:p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FiMapPin/> Giao hàng đến</p>
                                                <p className="text-sm font-bold text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed shadow-sm">
                                                    {order.shippingAddress}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FiCreditCard/> Thanh toán</p>
                                                <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 shadow-sm space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Phương thức:</span>
                                                        <span className="uppercase text-slate-900">{order.paymentMethod}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Trạng thái:</span>
                                                        <span className={`flex items-center gap-1 ${order.paymentStatus === 'Đã thanh toán' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {order.paymentStatus === 'Đã thanh toán' && <FiCheckCircle/>} {order.paymentStatus}
                                                        </span>
                                                    </div>
                                                    {order.transactionId && (
                                                        <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
                                                            <span className="text-slate-500 text-xs">Mã GD:</span>
                                                            <span className="text-xs font-mono text-slate-400">{order.transactionId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FiShoppingBag/> Sản phẩm đã mua</p>
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                {order.items && order.items.map((item, idx) => (
                                                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-slate-100 last:border-0 gap-4 hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <img 
                                                                src={item.productImage || 'https://via.placeholder.com/64'} 
                                                                alt={item.productName} 
                                                                className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center object-cover border border-slate-200"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/64' }} 
                                                            />
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">{item.productName}</p>
                                                                <p className="text-xs font-bold text-slate-400 mt-1">Đơn giá: {new Intl.NumberFormat('vi-VN').format(item.unitPrice)}đ</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[150px]">
                                                            <p className="text-sm font-bold text-slate-500">x{item.quantity}</p>
                                                            <p className="font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(item.unitPrice * item.quantity)}đ</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {order.status === 'Mới' && (
                                        <div className="p-5 md:px-8 md:pb-8 border-t border-slate-100 bg-white/50 flex justify-end">
                                            <button 
                                                // Thay vì gọi hàm Hủy trực tiếp, mình Mở Modal Xác nhận
                                                onClick={() => setConfirmModal(order.orderId)}
                                                disabled={cancellingOrderId === order.orderId}
                                                className="flex items-center gap-2 bg-red-50 text-red-500 border border-red-200 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-lg shadow-red-500/10 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                                            >
                                                {cancellingOrderId === order.orderId ? (
                                                    <><FiLoader className="animate-spin text-lg"/> ĐANG XỬ LÝ...</>
                                                ) : (
                                                    <><FiTrash2 className="text-lg"/> HỦY ĐƠN HÀNG NÀY</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* ========================================================= */}
            {/* MODAL XÁC NHẬN HỦY ĐƠN HÀNG (CUSTOM CONFIRM) */}
            {/* ========================================================= */}
            {confirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-slideUp text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                            <FiAlertTriangle />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">Xác nhận hủy đơn hàng</h2>
                        <p className="text-slate-500 mb-8 font-medium">
                            Bạn có chắc chắn muốn hủy đơn hàng <strong className="text-slate-800">#{confirmModal}</strong> không? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition-all active:scale-95"
                            >
                                QUAY LẠI
                            </button>
                            <button 
                                onClick={executeCancelOrder}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/30 active:scale-95"
                            >
                                ĐỒNG Ý HỦY
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;