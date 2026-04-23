import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../components/Toast';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    // Ép cuộn lên đầu trang khi vào
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Gửi dữ liệu xuống C# để C# gửi Mail
            await axios.post('http://localhost:5164/api/Contact', formData);
            
            showToast('Đã gửi tin nhắn thành công! Chúng tôi sẽ liên hệ sớm nhất.', 'success');
            setFormData({ name: '', email: '', phone: '', message: '' }); // Reset form
        } catch (error) {
            showToast('Lỗi khi gửi tin nhắn. Vui lòng thử lại sau!', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fadeIn min-h-screen">
            
            {/* --- HEADER --- */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-4">
                    Liên hệ <span className="text-blue-600">SaboTech</span>
                </h1>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                    Bạn có câu hỏi, góp ý hay cần tư vấn về sản phẩm? Hãy để lại thông tin, đội ngũ SaboTech luôn sẵn sàng hỗ trợ bạn 24/7.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* --- CỘT TRÁI: THÔNG TIN & BẢN ĐỒ --- */}
                <div className="space-y-8">
                    {/* Các thẻ thông tin */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-blue-500/30 mb-4">
                                <FiMapPin />
                            </div>
                            <h3 className="font-black text-slate-800 mb-2">Địa chỉ cửa hàng</h3>
                            <p className="text-sm text-slate-500 font-medium">180 Cao Lỗ, Phường 4<br/>Quận 8, TP.Hồ Chí Minh</p>
                        </div>

                        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30 mb-4">
                                <FiPhone />
                            </div>
                            <h3 className="font-black text-slate-800 mb-2">Điện thoại</h3>
                            <p className="text-sm text-slate-500 font-medium">0123.456.789<br/>0987.654.321</p>
                        </div>

                        <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-amber-500/30 mb-4">
                                <FiMail />
                            </div>
                            <h3 className="font-black text-slate-800 mb-2">Email hỗ trợ</h3>
                            <p className="text-sm text-slate-500 font-medium">support@sabotech.vn<br/>cskh@sabotech.vn</p>
                        </div>

                        <div className="bg-violet-50/50 p-6 rounded-3xl border border-violet-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-violet-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-violet-500/30 mb-4">
                                <FiClock />
                            </div>
                            <h3 className="font-black text-slate-800 mb-2">Giờ làm việc</h3>
                            <p className="text-sm text-slate-500 font-medium">Thứ 2 - Thứ 7: 8h00 - 22h00<br/>Chủ nhật: 9h00 - 20h00</p>
                        </div>
                    </div>

                    {/* Bản đồ Google Maps nhúng */}
                    <div className="w-full h-64 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0242203923955!2d106.67756851532057!3d10.739097792346764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fad027e3727%3A0x2a77b414e887f86d!2zMTgwIENhbyBM4buXLCBQaMaw4budbmcgNCwgUXXhuq1uIDgsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1680000000000!5m2!1svi!2s" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Bản đồ SaboTech"
                        ></iframe>
                    </div>
                </div>

                {/* --- CỘT PHẢI: FORM ĐIỀN THÔNG TIN --- */}
                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <h2 className="text-2xl font-black text-slate-800 mb-6 relative z-10">Gửi lời nhắn cho chúng tôi</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Họ và tên *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="VD: Nguyễn Văn A" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Số điện thoại *</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="VD: 0987654321" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Email của bạn *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="VD: sabotech@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium transition-all" />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Nội dung lời nhắn *</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} required rows="4" placeholder="Bạn cần hỗ trợ gì ạ?" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"></textarea>
                        </div>

                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg shadow-slate-200 transition-all hover:bg-blue-600 active:scale-95">
                            <FiSend className="text-lg" /> {loading ? "ĐANG GỬI THƯ..." : "GỬI TIN NHẮN"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Contact;