import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export const showToast = (message, type = 'success') => {
    const event = new CustomEvent('sabo-toast', { detail: { message, type } });
    window.dispatchEvent(event);
};

const Toast = () => {
    // Thêm 'id' để mỗi lần gọi Toast, thanh trượt sẽ tự reset lại từ đầu
    const [toast, setToast] = useState({ show: false, message: '', type: 'success', id: 0 });
    const [isClosing, setIsClosing] = useState(false); // Trạng thái mờ dần trước khi tắt hẳn

    useEffect(() => {
        const handleToast = (e) => {
            setToast({ 
                show: true, 
                message: e.detail.message, 
                type: e.detail.type, 
                id: Date.now() // Tạo ID mới để reset animation
            });
            setIsClosing(false); // Đảm bảo không bị mờ
            
            // Chờ 2.6 giây thì bắt đầu hiệu ứng mờ dần bay ra ngoài
            setTimeout(() => {
                setIsClosing(true);
            }, 2600);

            // Chờ đúng 3 giây thì tắt hẳn component
            setTimeout(() => {
                setToast(prev => ({ ...prev, show: false }));
            }, 3000);
        };

        window.addEventListener('sabo-toast', handleToast);
        return () => window.removeEventListener('sabo-toast', handleToast);
    }, []);

    if (!toast.show) return null;

    return (
        <div className={`fixed top-24 right-6 z-[9999] transition-all duration-300 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
            {/* Hộp thoại Toast - Thêm overflow-hidden và relative để chứa thanh trượt */}
            <div className={`relative overflow-hidden flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-white ${
                toast.type === 'success' ? 'shadow-emerald-500/20' : 'shadow-red-500/20'
            }`}>
                
                {/* ICON */}
                {toast.type === 'success' ? (
                    <FiCheckCircle className="text-2xl text-emerald-500" />
                ) : (
                    <FiAlertCircle className="text-2xl text-red-500" />
                )}
                
                {/* NỘI DUNG */}
                <span className="font-bold text-slate-700">{toast.message}</span>

                {/* 🔥 THANH TRƯỢT THẦN THÁNH Ở ĐÁY HỘP 🔥 */}
                <div 
                    key={toast.id} // Quan trọng: Key giúp thanh trượt chạy lại từ đầu nếu click nhiều lần
                    className={`absolute bottom-0 left-0 h-1 animate-shrink ${
                        toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                ></div>
                
            </div>
        </div>
    );
};

export default Toast;