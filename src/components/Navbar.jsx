import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BiHomeAlt, BiInfoCircle, BiNews, BiEnvelope, 
  BiShield, BiShoppingBag, BiUser, BiPlusCircle, 
  BiLogOut, BiChevronDown, BiCreditCard, BiWallet 
} from 'react-icons/bi';
import { useData } from '../context/DataContext';
import { supabase } from '../supabaseClient';
import '../styles/summer-theme.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { siteSettings, isAuthenticated, userProfile, loading } = useData();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const navbarNav = document.getElementById('navbarNav');
    if (navbarNav && navbarNav.classList.contains('show')) {
      const toggler = document.querySelector('.navbar-toggler');
      if (toggler) toggler.click();
    }
    setShowProfileMenu(false);
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'TRANG CHỦ', icon: BiHomeAlt },
    { path: '/shop', label: 'CỬA HÀNG', icon: BiShoppingBag },
    { path: '/news', label: 'TIN TỨC', icon: BiNews },
    { path: '/contact', label: 'LIÊN HỆ', icon: BiEnvelope },
  ];

  return (
    <motion.nav
      className="navbar navbar-expand-lg sticky-top py-3"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{ 
        background: 'rgba(255, 255, 255, 0.98)', 
        borderBottom: '4px solid var(--summer-ocean-blue)',
        boxShadow: '0 4px 30px rgba(0, 119, 190, 0.1)',
        zIndex: 10000,
        backdropFilter: 'blur(15px)'
      }}
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="bg-info bg-opacity-10 p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm">
             <span style={{ fontSize: '24px' }}>🌊</span>
          </div>
          <span className="fw-black text-primary h3 m-0" style={{ letterSpacing: '-1.5px', textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {siteSettings?.site_title?.toUpperCase() || 'BUILDNCHILL'}
          </span>
        </Link>

        <button className="navbar-toggler border-0 shadow-none bg-light p-2 rounded-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link 
                  className={`nav-link px-3 py-2 fw-black transition-all rounded-pill ${isActive(item.path) ? 'text-white bg-info shadow-sm' : 'text-primary hover-text-info'}`} 
                  to={item.path}
                >
                  <item.icon className="me-1 mb-1" /> {item.label}
                </Link>
              </li>
            ))}
            
            <li className="nav-item ms-lg-3 mt-3 mt-lg-0" ref={menuRef}>
              {loading ? (
                <div className="spinner-border spinner-border-sm text-info mx-3"></div>
              ) : isAuthenticated ? (
                <div className="position-relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="btn d-flex align-items-center gap-3 p-1 pe-3 rounded-pill bg-white border-2 transition-all shadow-sm"
                    style={{ borderColor: 'var(--summer-ocean-blue)' }}
                  >
                    <div className="bg-info rounded-circle p-1 shadow-sm">
                      <img 
                        src={`https://vzge.me/bust/${userProfile?.username || 'Steve'}.png`} 
                        alt="avatar" 
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="text-start d-none d-sm-block">
                      <div className="fw-black text-primary leading-tight small" style={{ fontSize: '0.85rem' }}>{userProfile?.username?.toUpperCase()}</div>
                      <div className="text-info fw-bold" style={{ fontSize: '0.7rem' }}>{(userProfile?.wallet_balance || 0).toLocaleString()}đ</div>
                    </div>
                    <BiChevronDown className={`text-primary transition-all ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="position-absolute end-0 mt-3 summer-glass p-3 shadow-2xl border-0 bg-white"
                        style={{ minWidth: '240px', zIndex: 10001 }}
                      >
                        <div className="p-3 bg-info bg-opacity-10 rounded-4 mb-3 text-center border border-info border-opacity-10">
                          <div className="small fw-black text-primary opacity-60 mb-1">SỐ DƯ VÍ</div>
                          <div className="fw-black text-info h4 m-0">{(userProfile?.wallet_balance || 0).toLocaleString()} VNĐ</div>
                        </div>

                        <div className="d-flex flex-column gap-1">
                          <Link to="/profile" className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none fw-bold text-primary hover-bg-info hover-text-white transition-all">
                            <BiUser size={20} /> Hồ sơ cá nhân
                          </Link>
                          
                          <Link to="/recharge" className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none fw-bold text-primary hover-bg-info hover-text-white transition-all">
                            <BiPlusCircle size={20} className="text-success" /> Nạp tiền vào ví
                          </Link>

                          {userProfile?.role === 'admin' && (
                            <Link to="/admin" className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none fw-bold text-primary hover-bg-info hover-text-white transition-all">
                              <BiShield size={20} className="text-danger" /> Trang quản trị
                            </Link>
                          )}

                          <div className="border-top mt-2 pt-2">
                            <button onClick={handleLogout} className="w-100 border-0 bg-transparent d-flex align-items-center gap-3 p-2 rounded-3 text-danger fw-bold hover-bg-danger hover-text-white transition-all">
                              <BiLogOut size={20} /> Đăng xuất
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="summer-button py-2 px-4 rounded-pill shadow-lg d-flex align-items-center gap-2">
                  <BiUser size={18} /> ĐĂNG NHẬP
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
