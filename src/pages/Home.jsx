import { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // Dữ liệu mẫu cho sản phẩm nổi bật (Sau này bạn sẽ fetch từ API)
  const [products] = useState([
    { id: 1, name: "Laptop Gaming ASUS TUF F15", price: 17990000, img: "💻", tag: "Bán chạy" },
    { id: 2, name: "Card màn hình MSI RTX 4060", price: 8500000, img: "🎮", tag: "Mới" },
    { id: 3, name: "Màn hình Dell UltraSharp 27 inch", price: 10200000, img: "🖥️", tag: "-10%" },
    { id: 4, name: "Bàn phím cơ Logitech G Pro X", price: 2900000, img: "⌨️", tag: "Hot" },
  ]);

  return (
    <div className="animate-fadeIn">
      {/* --- HERO SECTION: BANNER CHÍNH --- */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl mb-12 shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative px-8 py-16 md:px-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-6 text-center md:text-left">
            <span className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase">
              SaboTech Gaming Hub
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Nâng Tầm Trải Nghiệm <br/> 
              <span className="text-blue-500">Chiến Game Đỉnh Cao</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Chuyên cung cấp linh kiện PC, Laptop Gaming chính hãng với chế độ bảo hành 1 đổi 1 tốt nhất cho sinh viên STU.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/products" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                MUA SẮM NGAY
              </Link>
              <button className="px-8 py-4 border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                BUILD PC ONLINE
              </button>
            </div>
          </div>
          
          <div className="text-[180px] md:text-[250px] drop-shadow-2xl animate-bounce-slow">
            💻
          </div>
        </div>
      </section>

      {/* --- FEATURED PRODUCTS: SẢN PHẨM NỔI BẬT --- */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Sản phẩm nổi bật</h2>
            <div className="w-20 h-1.5 bg-blue-600 mt-2 rounded-full"></div>
          </div>
          <Link to="/products" className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-2">
            Xem tất cả <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <div key={p.id} className="group bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-2xl transition-all duration-300 relative">
              {/* Badge */}
              <span className="absolute top-4 left-4 z-10 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded uppercase">
                {p.tag}
              </span>
              
              {/* Product Image */}
              <div className="bg-slate-50 aspect-square rounded-xl flex items-center justify-center text-7xl mb-4 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                {p.img}
              </div>

              {/* Info */}
              <div className="space-y-2 text-center">
                <h3 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors h-12 overflow-hidden">
                  {p.name}
                </h3>
                <p className="text-2xl font-black text-slate-900">
                  {p.price.toLocaleString()}đ
                </p>
                <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600">
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- PROMO BANNERS: BANNER PHỤ --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-10 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-2">Linh Kiện PC</h3>
            <p className="text-blue-100 mb-6">Giảm đến 30% cho Combo Mainboard + CPU</p>
            <Link to="/products" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold text-sm">XEM NGAY</Link>
          </div>
          <div className="absolute -right-5 -bottom-5 text-9xl opacity-20 group-hover:rotate-12 transition-transform">⚙️</div>
        </div>
        
        <div className="bg-slate-800 rounded-3xl p-10 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-2">Gaming Gear</h3>
            <p className="text-slate-400 mb-6">Trải nghiệm âm thanh 7.1 cực sống động</p>
            <Link to="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm">KHÁM PHÁ</Link>
          </div>
          <div className="absolute -right-5 -bottom-5 text-9xl opacity-20 group-hover:rotate-12 transition-transform">🎧</div>
        </div>
      </section>
    </div>
  );
};

export default Home;