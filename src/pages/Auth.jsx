import { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import SummerEffect from '../components/SummerEffect';
import '../styles/summer-theme.css';

const Auth = () => {
  const { login, register } = useData();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const username = formData.username.trim();
    if (!username || username.includes(' ')) {
      alert("Tên nhân vật không được để trống và không chứa khoảng trắng!");
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        const success = await register(username, formData.password);
        if (success) {
          alert('Đăng ký thành công! Chào mừng ' + username);
          window.location.href = '/shop';
        } else {
          throw new Error('Đăng ký thất bại. Tên nhân vật có thể đã tồn tại.');
        }
      } else {
        const success = await login(username, formData.password);
        if (success) {
          window.location.href = '/shop';
        } else {
          throw new Error('Tên nhân vật hoặc mật khẩu không chính xác!');
        }
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-summer-container d-flex align-items-center justify-content-center min-vh-100">
      <SummerEffect />
      
      {/* Summer Background Items */}
      <div className="summer-item" style={{ top: '10%', right: '10%', fontSize: '50px' }}>🌴</div>
      <div className="summer-item dolphin" style={{ bottom: '15%', left: '-30px' }}>🐬</div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="summer-glass p-5 w-100 shadow-2xl border-0" 
        style={{ maxWidth: '450px', zIndex: 10 }}
      >
        <div className="text-center mb-5">
          <div className="bg-white p-2 rounded-circle d-inline-block shadow-lg mb-4 border border-info border-4">
            <img 
              src={formData.username ? `https://vzge.me/bust/${formData.username}.png` : 'https://vzge.me/bust/Steve.png'} 
              alt="avatar" 
              className="rounded-circle"
              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
            />
          </div>
          <h2 className="summer-title m-0">{isRegister ? 'ĐĂNG KÝ MỚI' : 'ĐĂNG NHẬP'}</h2>
          <p className="fw-bold text-primary mt-2">Hệ Thống BuildnChill Ocean 🌊</p>
        </div>

        <form onSubmit={handleAuth} className="d-flex flex-column gap-4">
          <div>
            <label className="summer-label">Tên nhân vật Minecraft (IGN)</label>
            <input 
              type="text" className="summer-input w-100" required
              placeholder="Nhập tên nhân vật..."
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            <div className="text-info mt-2 fw-bold" style={{ fontSize: '0.75rem' }}>* Tên dùng để nhận quà trong game</div>
          </div>
          
          <div>
            <label className="summer-label">Mật khẩu</label>
            <input 
              type="password" className="summer-input w-100" required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="summer-button w-100 py-3 mt-2 shadow-xl" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : null}
            {isRegister ? 'ĐĂNG KÝ NGAY 🚀' : 'VÀO HÀNH TRÌNH ⛵'}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top border-info border-opacity-10">
          <button className="btn btn-link text-primary fw-black text-decoration-none hover-text-info" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
