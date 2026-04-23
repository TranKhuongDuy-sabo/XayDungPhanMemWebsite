import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast';
import { FiMessageSquare, FiTrash2, FiStar, FiBookmark, FiAlertTriangle } from 'react-icons/fi';

const ReviewManager = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    // Lấy username an toàn: Ưu tiên sessionStorage, nếu chưa có thì lấy localStorage
    const adminUsername = sessionStorage.getItem('username') || localStorage.getItem('username');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get('http://localhost:5164/api/Reviews/admin/all');
            setReviews(res.data);
        } catch (error) {
            showToast("Lỗi tải danh sách đánh giá!", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 HÀM "MỔ BỤNG" MỌI THỂ LOẠI LỖI TỪ C# .NET CORE
    const extractErrorMessage = (error) => {
        console.error("Chi tiết lỗi API:", error.response); // In ra Console để dễ debug
        if (!error.response) return "Lỗi mạng hoặc máy chủ không phản hồi!";
        
        const data = error.response.data;
        if (!data) return `Lỗi thao tác (HTTP ${error.response.status})`;
        
        if (typeof data === 'string') return data;
        if (data.message) return data.message;
        if (data.title) return data.title; // Lỗi mặc định của ASP.NET
        if (data.errors) return Object.values(data.errors)[0][0]; // Lỗi Validation
        
        return "Lỗi không xác định từ hệ thống!";
    };

    const handleTogglePin = async (id) => {
        try {
            const res = await axios.put(`http://localhost:5164/api/Reviews/admin/toggle-pin/${id}`);
            showToast(res.data.message || "Đã cập nhật trạng thái ghim!", "success");
            setReviews(reviews.map(r => r.id === id ? { ...r, isPinned: res.data.isPinned } : r));
        } catch (error) {
            showToast(extractErrorMessage(error), "error");
        }
    };

    const executeDelete = async () => {
        if (!reviewToDelete) return;
        
        if (!adminUsername) {
            showToast("Lỗi: Không tìm thấy phiên đăng nhập Admin!", "error");
            setReviewToDelete(null);
            return;
        }
        
        try {
            await axios.delete(`http://localhost:5164/api/Reviews/${reviewToDelete.id}/${adminUsername}`);
            showToast("Đã xóa đánh giá thành công!", "success");
            setReviews(reviews.filter(r => r.id !== reviewToDelete.id));
            setReviewToDelete(null); 
        } catch (error) {
            // 🔥 Hiển thị chính xác lỗi thay vì "Lỗi hệ thống"
            showToast(extractErrorMessage(error), "error");
            setReviewToDelete(null);
        }
    };

    return (
        <div className="p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <FiMessageSquare className="text-2xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Quản lý Đánh giá</h1>
                    <p className="text-slate-500 text-sm font-medium">Kiểm duyệt và ghim các đánh giá nổi bật ra trang chủ</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-500 font-bold">
                                <th className="p-5">Khách hàng</th>
                                <th className="p-5">Sản phẩm</th>
                                <th className="p-5">Đánh giá</th>
                                <th className="p-5 w-1/3">Nội dung</th>
                                <th className="p-5 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-bold animate-pulse">Đang tải...</td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-bold">Chưa có đánh giá nào.</td></tr>
                            ) : (
                                reviews.map(rev => (
                                    <tr key={rev.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${rev.isPinned ? 'bg-amber-50/30' : ''}`}>
                                        <td className="p-5">
                                            <p className="font-bold text-slate-800">{rev.username}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </td>
                                        <td className="p-5 font-bold text-blue-600 line-clamp-2 mt-3">{rev.productName}</td>
                                        <td className="p-5">
                                            <div className="flex text-amber-400 text-sm">
                                                {[...Array(5)].map((_, i) => <FiStar key={i} className={i < rev.rating ? 'fill-amber-400' : 'text-slate-200 fill-slate-200'} />)}
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm text-slate-600 font-medium">{rev.comment}</td>
                                        <td className="p-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleTogglePin(rev.id)}
                                                    className={`p-2 rounded-lg transition-all ${rev.isPinned ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
                                                    title={rev.isPinned ? "Bỏ ghim" : "Ghim ra Trang chủ"}
                                                >
                                                    <FiBookmark className={rev.isPinned ? "fill-amber-600" : ""} />
                                                </button>
                                                <button 
                                                    onClick={() => setReviewToDelete(rev)}
                                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                    title="Xóa đánh giá"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL XÁC NHẬN XÓA */}
            {reviewToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-slideUp">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            <FiAlertTriangle />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Xác nhận xóa!</h3>
                        <p className="text-slate-500 mb-6 font-medium">
                            Bạn có chắc muốn xóa đánh giá của khách hàng <strong className="text-slate-800">{reviewToDelete.username}</strong>? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setReviewToDelete(null)} 
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
        </div>
    );
};

export default ReviewManager;