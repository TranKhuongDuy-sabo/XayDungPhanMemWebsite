import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast';
import { 
    FiBox, FiEdit, FiTrash2, FiX, FiPrinter, 
    FiUser, FiMapPin, FiPhone, FiCreditCard, FiCalendar, FiFileText, FiAlertTriangle
} from 'react-icons/fi';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    // 🔥 STATE CHO MODAL XÓA ĐƠN HÀNG
    const [orderToDelete, setOrderToDelete] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5164/api/Orders');
            setOrders(res.data);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
            showToast("Không thể tải danh sách đơn hàng!", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 HÀM "MỔ BỤNG" LỖI TỪ C# (Dùng chung cho toàn file)
    const extractErrorMessage = (error) => {
        console.error("Chi tiết lỗi API:", error.response); 
        if (!error.response) return "Lỗi mạng hoặc máy chủ không phản hồi!";
        
        const data = error.response.data;
        if (!data) return `Lỗi thao tác (HTTP ${error.response.status})`;
        
        if (typeof data === 'string') return data;
        if (data.message) return data.message;
        if (data.title) return data.title; 
        if (data.errors) return Object.values(data.errors)[0][0]; 
        
        return "Lỗi không xác định từ hệ thống!";
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;
        try {
            await axios.put(`http://localhost:5164/api/Orders/${selectedOrder.orderId}/status`, { status: newStatus });
            showToast("Cập nhật trạng thái thành công!", "success");
            
            setOrders(orders.map(o => o.orderId === selectedOrder.orderId ? { ...o, status: newStatus } : o));
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        } catch (error) {
            showToast(extractErrorMessage(error), "error");
        }
    };

    // 🔥 HÀM THỰC THI XÓA ĐƠN HÀNG (KHI BẤM ĐỒNG Ý TRONG MODAL)
    const executeDelete = async () => {
        if (!orderToDelete) return;
        try {
            await axios.delete(`http://localhost:5164/api/Orders/${orderToDelete.orderId}`);
            setOrders(orders.filter(o => o.orderId !== orderToDelete.orderId));
            showToast(`Đã xóa đơn hàng #${orderToDelete.orderId} thành công!`, "success");
            setOrderToDelete(null); // Đóng Modal
        } catch (error) {
            let errMsg = extractErrorMessage(error);
            // Bổ sung thông báo nếu C# chặn do ràng buộc khóa ngoại
            if (error.response?.status === 400 || error.response?.status === 500) {
                errMsg = "Không thể xóa cứng đơn hàng đã có chi tiết sản phẩm hoặc thanh toán. Gợi ý: Hãy đổi trạng thái thành 'Đã hủy'.";
            }
            showToast(errMsg, "error");
            setOrderToDelete(null); // Đóng Modal
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Mới': return 'bg-blue-100 text-blue-600';
            case 'Đang giao': return 'bg-amber-100 text-amber-600';
            case 'Đã giao': return 'bg-emerald-100 text-emerald-600';
            case 'Đã hủy': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <FiBox className="text-2xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Quản lý Đơn hàng</h1>
                    <p className="text-slate-500 text-sm font-medium">Theo dõi chi tiết và cập nhật trạng thái vận chuyển</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-500 font-bold">
                                <th className="p-5">Mã đơn</th>
                                <th className="p-5">Khách hàng</th>
                                <th className="p-5">Ngày đặt</th>
                                <th className="p-5">Tổng tiền</th>
                                <th className="p-5">Trạng thái</th>
                                <th className="p-5 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 && !loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có đơn hàng nào.</td></tr>
                            ) : orders.map((order, idx) => (
                                <tr key={order.orderId || idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5 font-black text-slate-800">#{order.orderId}</td>
                                    <td className="p-5 font-bold text-slate-700">{order.customerName}</td>
                                    <td className="p-5 text-slate-500 text-sm font-medium">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-5 font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => { setSelectedOrder(order); setNewStatus(order.status); }}
                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                                title="Xem chi tiết & Cập nhật"
                                            >
                                                <FiEdit />
                                            </button>
                                            <button 
                                                // 🔥 MỞ MODAL XÓA THAY VÌ CONFIRM
                                                onClick={() => setOrderToDelete(order)}
                                                className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                title="Xóa đơn hàng"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 🔥 MODAL XÁC NHẬN XÓA (THAY CHO ALERT MẶC ĐỊNH) 🔥 */}
            {/* ======================================================== */}
            {orderToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-slideUp">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            <FiAlertTriangle />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Cảnh báo xóa đơn hàng!</h3>
                        <p className="text-slate-500 mb-6 font-medium">
                            Bạn có chắc muốn xóa vĩnh viễn đơn hàng <strong className="text-slate-800">#{orderToDelete.orderId}</strong> của khách hàng <strong className="text-slate-800">{orderToDelete.customerName}</strong>? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setOrderToDelete(null)} 
                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={executeDelete} 
                                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                            >
                                ĐỒNG Ý XÓA
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL HÓA ĐƠN CHI TIẾT (GIỮ NGUYÊN) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div id="printable-bill" className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative animate-slideUp">
                        
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-full transition-colors no-print">
                            <FiX className="text-2xl" />
                        </button>

                        <div className="p-8">
                            {/* HEADER */}
                            <div className="border-b border-slate-200 pb-6 mb-6 flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                        <FiFileText className="text-blue-600"/> HÓA ĐƠN MUA HÀNG
                                    </h2>
                                    <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                                        <FiCalendar /> {new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">MÃ ĐƠN HÀNG</p>
                                    <p className="text-3xl font-black text-blue-600">#{selectedOrder.orderId}</p>
                                </div>
                            </div>

                            {/* THÔNG TIN */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiUser/> Khách hàng</h3>
                                    <div className="space-y-2 text-sm font-medium text-slate-700">
                                        <p className="font-bold text-slate-900 text-base">{selectedOrder.customerName}</p>
                                        <p className="flex items-center gap-2"><FiPhone className="text-slate-400"/> {selectedOrder.phone}</p>
                                        <p className="flex items-start gap-2"><FiMapPin className="text-slate-400 mt-1 min-w-[16px]"/> <span className="flex-1">{selectedOrder.shippingAddress}</span></p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiCreditCard/> Thanh toán</h3>
                                    <div className="space-y-2 text-sm font-medium text-slate-700">
                                        <p className="flex justify-between border-b border-slate-200 pb-2"><span>Phương thức:</span> <strong className="uppercase">{selectedOrder.paymentMethod}</strong></p>
                                        <p className="flex justify-between pt-1">
                                            <span>Trạng thái GD:</span> 
                                            <strong className={selectedOrder.paymentStatus === 'Đã thanh toán' ? 'text-emerald-600' : 'text-amber-600'}>
                                                {selectedOrder.paymentStatus}
                                            </strong>
                                        </p>
                                        {selectedOrder.transactionId && (
                                            <p className="flex justify-between text-xs text-slate-500 mt-2"><span>Mã GD:</span> <span className="font-mono">{selectedOrder.transactionId}</span></p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BẢNG SẢN PHẨM MỚI LẤY TỪ API */}
                            <div className="mb-8">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
                                            <th className="py-3">Sản phẩm</th>
                                            <th className="py-3 text-center">SL</th>
                                            <th className="py-3 text-right">Đơn giá</th>
                                            <th className="py-3 text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            selectedOrder.items.map((item, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 text-sm font-bold text-slate-700">
                                                    <td className="py-4 pr-4 text-blue-600">{item.productName}</td>
                                                    <td className="py-4 text-center">{item.quantity}</td>
                                                    <td className="py-4 text-right">{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}đ</td>
                                                    <td className="py-4 text-right text-emerald-600">{new Intl.NumberFormat('vi-VN').format(item.unitPrice * item.quantity)}đ</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4" className="py-6 text-center text-slate-400 italic font-medium">Chưa có chi tiết sản phẩm.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* TỔNG KẾT TIỀN */}
                            <div className="flex justify-end border-t border-slate-200 pt-6 mb-8">
                                <div className="text-right">
                                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-1">Cần thanh toán</p>
                                    <p className="text-4xl font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(selectedOrder.totalAmount)}đ</p>
                                </div>
                            </div>

                            {/* THAO TÁC (ẨN KHI IN) */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <label className="font-bold text-slate-700">Trạng thái:</label>
                                    <select 
                                        value={newStatus} 
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700 flex-1 md:w-48 transition-all"
                                    >
                                        <option value="Mới">Mới (Đang xử lý)</option>
                                        <option value="Đang giao">Đang giao hàng</option>
                                        <option value="Đã giao">Đã giao thành công</option>
                                        <option value="Đã hủy">Đã hủy</option>
                                    </select>
                                    <button 
                                        onClick={handleUpdateStatus}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                                    >
                                        LƯU
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={handlePrint}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                                >
                                    <FiPrinter className="text-lg"/> IN HÓA ĐƠN
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;