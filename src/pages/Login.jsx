import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { BiShield, BiUser, BiLock, BiStar } from 'react-icons/bi';
import SummerEffect from '../components/SummerEffect';
import '../styles/summer-theme.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="shop-summer-container d-flex align-items-center justify-content-center" style={{ minHeight: '85vh' }}>
      <SummerEffect />
      <div className="container" style={{ zIndex: 2 }}>
        <div className="row">
          <div className="col-md-5 mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="summer-glass p-5 shadow-lg border-info border-opacity-25">
                <div className="text-center mb-5">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="mb-4 d-inline-flex p-3 rounded-circle bg-info bg-opacity-10 text-info"
                  >
                    <BiStar size={60} />
                  </motion.div>
                  <h2 className="summer-title mb-2">
                    Đăng Nhập
                  </h2>
                  <p className="text-muted fw-bold">Hệ Thống Quản Trị Ocean Summer</p>
                </div>

                {error && (
                  <motion.div
                    className="alert alert-danger border-0 rounded-4 mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="summer-label">
                      <BiUser className="me-2"/> Tên Đăng Nhập
                    </label>
                    <input
                      type="text"
                      className="summer-input"
                      placeholder="Nhập tên tài khoản..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="summer-label">
                      <BiLock className="me-2"/> Mật Khẩu
                    </label>
                    <input
                      type="password"
                      className="summer-input"
                      placeholder="Nhập mật khẩu..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="summer-button mt-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    VÀO HỆ THỐNG 🌊
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
