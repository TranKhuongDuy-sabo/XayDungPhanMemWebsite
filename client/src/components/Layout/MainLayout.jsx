import { Outlet } from 'react-router-dom';
import Header from './Header'; // Import từ cùng thư mục Layout
import Footer from './Footer'; // Import từ cùng thư mục Layout

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* Nơi các trang con (Home, Products) hiện ra */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;