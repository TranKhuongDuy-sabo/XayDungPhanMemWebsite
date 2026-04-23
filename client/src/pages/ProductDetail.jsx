import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../components/Toast';
import { FiShoppingCart, FiStar, FiUser, FiTrash2, FiMessageCircle, FiBox } from 'react-icons/fi';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State form Review
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    
    const username = localStorage.getItem('username');

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Lấy chi tiết SP và Reviews cùng lúc
            const [prodRes, revRes] = await Promise.all([
                axios.get(`http://localhost:5164/api/Products/${id}`),
                axios.get(`http://localhost:5164/api/Reviews/product/${id}`)
            ]);
            setProduct(prodRes.data);
            setReviews(revRes.data);
        } catch (error) {
            showToast("Lỗi tải thông tin sản phẩm!", "error");
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        const cartKey = username ? `cart_${username}` : 'cart_guest';
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        const existingItem = cart.find(i => i.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
        }
        
        localStorage.setItem(cartKey, JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));
        showToast("Đã thêm vào giỏ hàng!", "success");
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!username) return showToast("Vui lòng đăng nhập để đánh giá!", "error");
        if (!comment.trim()) return showToast("Vui lòng nhập nội dung đánh giá!", "error");

        try {
            await axios.post('http://localhost:5164/api/Reviews', {
                productId: id, username: username, rating: rating, comment: comment
            });
            showToast("Gửi đánh giá thành công!", "success");
            setComment('');
            setRating(5);
            fetchData(); // Load lại data
        } catch (error) {
            showToast("Lỗi khi gửi đánh giá!", "error");
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm("Xóa đánh giá này?")) return;
        try {
            await axios.delete(`http://localhost:5164/api/Reviews/${reviewId}/${username}`);
            showToast("Đã xóa đánh giá!", "success");
            setReviews(reviews.filter(r => r.id !== reviewId));
        } catch (error) {
            showToast("Lỗi khi xóa!", "error");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Đang tải dữ liệu...</div>;
    if (!product) return null;

    // Tính sao trung bình
    const avgRating = reviews.length > 0 ? (reviews.reduce((a, c) => a + c.rating, 0) / reviews.length).toFixed(1) : 0;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-fadeIn min-h-screen">
            {/* THÔNG TIN SẢN PHẨM */}
            <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row gap-10 mb-12">
                <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <img src={product.image} alt={product.name} className="w-full max-w-sm h-auto object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 w-fit">Hàng chính hãng</div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 leading-tight">{product.name}</h1>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex text-amber-400 text-lg">
                            {[...Array(5)].map((_, i) => <FiStar key={i} className={i < Math.round(avgRating) ? 'fill-amber-400' : 'text-slate-200 fill-slate-200'} />)}
                        </div>
                        <span className="text-slate-500 font-bold text-sm">{avgRating}/5 ({reviews.length} đánh giá)</span>
                    </div>

                    <p className="text-4xl font-black text-blue-600 mb-8">{new Intl.NumberFormat('vi-VN').format(product.price)}đ</p>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                        <p className="font-bold text-slate-800 mb-2 flex items-center gap-2"><FiBox/> Mô tả sản phẩm</p>
                        <p className="text-slate-600 text-sm leading-relaxed">{product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>
                    </div>

                    <button onClick={handleAddToCart} className="w-full md:w-auto bg-slate-900 hover:bg-blue-600 text-white font-black py-4 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-blue-500/30 active:scale-95 uppercase tracking-widest">
                        <FiShoppingCart className="text-xl" /> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>

            {/* KHU VỰC REVIEW */}
            <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100">
                <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <FiMessageCircle className="text-blue-600" /> Đánh giá từ khách hàng
                </h2>

                {/* Form Viết Review (Chỉ hiện khi đã đăng nhập) */}
                {username ? (
                    <form onSubmit={submitReview} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-10">
                        <p className="font-bold text-slate-800 mb-4">Gửi đánh giá của bạn</p>
                        <div className="flex items-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button type="button" key={num} onClick={() => setRating(num)} className={`text-2xl transition-all hover:scale-110 ${num <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}>
                                    <FiStar className={num <= rating ? 'fill-amber-400' : ''}/>
                                </button>
                            ))}
                        </div>
                        <textarea required value={comment} onChange={e => setComment(e.target.value)} rows="3" placeholder="Sản phẩm này thế nào? Hãy chia sẻ cảm nhận của bạn nhé..." className="w-full bg-white border border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all mb-4 resize-none" />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95">GỬI ĐÁNH GIÁ</button>
                    </form>
                ) : (
                    <div className="bg-blue-50 border border-blue-100 text-blue-600 p-4 rounded-xl font-bold mb-10 text-center">
                        Vui lòng <button onClick={() => navigate('/login')} className="underline">Đăng nhập</button> để gửi đánh giá!
                    </div>
                )}

                {/* Danh sách Review */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-center text-slate-400 font-bold py-10">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                    ) : (
                        reviews.map(rev => (
                            <div key={rev.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-black">
                                            <FiUser />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{rev.fullName || rev.username}</p>
                                            <div className="flex text-amber-400 text-xs">
                                                {[...Array(5)].map((_, i) => <FiStar key={i} className={i < rev.rating ? 'fill-amber-400' : 'text-slate-200 fill-slate-200'} />)}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Nút Xóa: Chỉ hiện nếu người đang xem là chủ nhân của bài review */}
                                    {username === rev.username && (
                                        <button onClick={() => deleteReview(rev.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2" title="Xóa đánh giá của tôi">
                                            <FiTrash2 className="text-lg" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-slate-600 text-sm ml-13 pl-[52px]">{rev.comment}</p>
                                <p className="text-xs text-slate-400 mt-2 ml-13 pl-[52px]">{new Date(rev.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;