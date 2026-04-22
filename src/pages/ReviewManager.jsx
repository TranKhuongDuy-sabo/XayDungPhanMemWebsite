import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast';
import { FiMessageSquare, FiTrash2, FiStar, FiBookmark } from 'react-icons/fi';

const ReviewManager = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            // Gọi API lấy TẤT CẢ đánh giá dành cho Admin
            const res = await axios.get('http://localhost:5164/api/Reviews/admin/all');
            setReviews(res.data);
        } catch (error) {
            showToast("Lỗi tải danh sách đánh giá!", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePin = async (id) => {
        try {
            const res = await axios.put(`http://localhost:5164/api/Reviews/admin/toggle-pin/${id}`);
            showToast(res.data.message, "success");
            // Cập nhật lại UI ngay lập tức
            setReviews(reviews.map(r => r.id === id ? { ...r, isPinned: res.data.isPinned } : r));
        } catch (error) {
            showToast("Lỗi khi ghim đánh giá!", "error");
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn đánh giá này?")) return;
        try {
            // Gọi API xóa (Admin có quyền xóa mọi bài)
            await axios.delete(`http://localhost:5164/api/Reviews/${id}/${username}`);
            showToast("Đã xóa đánh giá!", "success");
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            showToast("Lỗi khi xóa!", "error");
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
                                                    onClick={() => handleDelete(rev.id, rev.username)}
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
        </div>
    );
};

export default ReviewManager;