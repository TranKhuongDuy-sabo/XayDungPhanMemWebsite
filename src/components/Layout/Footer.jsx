const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <h3 className="text-white text-xl font-bold border-l-4 border-blue-600 pl-3">SABOTECH</h3>
          <p className="text-sm">Hệ thống bán lẻ thiết bị công nghệ hàng đầu tại TP.HCM.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">HỖ TRỢ</h4>
          <ul className="space-y-3 text-sm">
            <li>Chính sách bảo hành</li>
            <li>Giao hàng hỏa tốc</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">LIÊN HỆ</h4>
          <p className="text-sm">📍 180 Cao Lỗ, Quận 8, TP.HCM</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">THANH TOÁN</h4>
          <div className="flex gap-2">
            <span className="bg-white text-black p-1 rounded text-xs font-bold">VISA</span>
            <span className="bg-white text-black p-1 rounded text-xs font-bold">MOMO</span>
          </div>
        </div>
      </div>
      <div className="text-center mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500">
        © 2026 SaboTech Store - Hoàng Văn Giáp (STU)
      </div>
    </footer>
  );
};

export default Footer;