import React from 'react';
import { Link } from 'react-router-dom';
import { 
    FiMapPin, FiPhone, FiMail, FiShield, FiTruck, 
    FiRefreshCw, FiFacebook, FiInstagram, FiYoutube, 
    FiCreditCard, FiSmartphone, FiChevronRight 
} from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 pt-20 pb-8 mt-20 relative overflow-hidden font-sans border-t-[6px] border-blue-600">
            {/* Background glow mờ */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/10 blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                
                {/* CỘT 1: THƯƠNG HIỆU */}
                <div className="space-y-6">
                    <Link to="/" className="inline-block">
                        <h3 className="text-white text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-lg">SABO</span>TECH
                        </h3>
                    </Link>
                    <p className="text-sm leading-relaxed text-slate-400 font-medium">
                        Hệ thống bán lẻ thiết bị công nghệ, PC và laptop hàng đầu tại TP.HCM. Cam kết chính hãng, giá tốt nhất thị trường.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-lg">
                            <FiFacebook className="text-lg" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-pink-600 hover:-translate-y-1 transition-all shadow-lg">
                            <FiInstagram className="text-lg" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-red-600 hover:-translate-y-1 transition-all shadow-lg">
                            <FiYoutube className="text-lg" />
                        </a>
                    </div>
                </div>

                {/* CỘT 2: HỖ TRỢ KHÁCH HÀNG */}
                <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        Hỗ trợ dịch vụ
                    </h4>
                    <ul className="space-y-4 text-sm font-medium">
                        <li>
                            <Link to="/products" className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                                <FiChevronRight className="text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /> Mua sắm sản phẩm
                            </Link>
                        </li>
                        <li>
                            <a href="#" className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                                <FiShield className="text-slate-500 group-hover:text-blue-500 transition-colors" /> Chính sách bảo hành
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                                <FiTruck className="text-slate-500 group-hover:text-blue-500 transition-colors" /> Giao hàng hỏa tốc 2h
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                                <FiRefreshCw className="text-slate-500 group-hover:text-blue-500 transition-colors" /> Chính sách đổi trả
                            </a>
                        </li>
                    </ul>
                </div>

                {/* CỘT 3: THÔNG TIN LIÊN HỆ */}
                <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        Liên hệ với chúng tôi
                    </h4>
                    <ul className="space-y-5 text-sm font-medium">
                        <li className="flex items-start gap-3">
                            <FiMapPin className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                            <a href="https://maps.google.com/?q=180+Cao+Lỗ,+Quận+8,+TP.HCM" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                                180 Cao Lỗ, Phường 4, Quận 8, TP.Hồ Chí Minh
                            </a>
                        </li>
                        <li className="flex items-center gap-3">
                            <FiPhone className="text-blue-500 text-lg flex-shrink-0" />
                            <a href="tel:0123456789" className="hover:text-white transition-colors font-bold">
                                0123.456.789 <span className="text-slate-500 font-normal">(8:00 - 22:00)</span>
                            </a>
                        </li>
                        <li className="flex items-center gap-3">
                            <FiMail className="text-blue-500 text-lg flex-shrink-0" />
                            <a href="mailto:support@sabotech.vn" className="hover:text-white transition-colors">
                                support@sabotech.vn
                            </a>
                        </li>
                    </ul>
                </div>

                {/* CỘT 4: THANH TOÁN */}
                <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-6">
                        Thanh toán an toàn
                    </h4>
                    <p className="text-sm text-slate-400 mb-4 font-medium">Chúng tôi chấp nhận thanh toán qua các nền tảng bảo mật cao nhất.</p>
                    <div className="flex flex-wrap gap-3">
                        <div className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-black flex items-center gap-1 border border-slate-700 shadow-sm">
                            <FiCreditCard className="text-blue-400 text-lg" /> VISA
                        </div>
                        <div className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-black flex items-center gap-1 border border-slate-700 shadow-sm">
                            <FiCreditCard className="text-red-400 text-lg" /> MASTER
                        </div>
                        <div className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-black flex items-center gap-1 border border-slate-700 shadow-sm">
                            <FiSmartphone className="text-pink-500 text-lg" /> MOMO
                        </div>
                        <div className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-black flex items-center gap-1 border border-slate-700 shadow-sm">
                            <FiSmartphone className="text-emerald-400 text-lg" /> VNPAY
                        </div>
                    </div>
                </div>

            </div>

            {/* BẢN QUYỀN */}
            <div className="max-w-7xl mx-auto px-4 text-center mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
                <p>© 2026 SaboTech Store</p>
                <p>Thiết kế và Phát triển bởi <span className="text-white font-bold"> SaBoTech</span></p>
            </div>
        </footer>
    );
};

export default Footer;