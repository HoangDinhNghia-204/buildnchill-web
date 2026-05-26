import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDiscord } from 'react-icons/fa';
import { useData } from '../context/DataContext';

const Footer = () => {
  const { siteSettings, serverStatus } = useData();

  const socialLinks = [
    { icon: FaDiscord, href: siteSettings?.discord_url || 'https://discord.gg/buildnchill', label: 'Discord' }
  ];

  return (
    <motion.footer
      className="footer-summer py-5"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'linear-gradient(180deg, #0077be 0%, #005a8d 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Wave effect at top of footer */}
      <div className="footer-wave" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '50px', background: 'rgba(255,255,255,0.1)', transform: 'translateY(-100%)' }}></div>

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="row g-4">
          <div className="col-lg-4 col-md-6 mb-4">
            <h4 className="fw-black mb-4 text-info" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{siteSettings?.site_title || 'BuildnChill'}</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Giải nhiệt mùa hè cùng server Minecraft cộng đồng thân thiện nhất. 
              Xây dựng, khám phá và tận hưởng kỳ nghỉ cùng chúng tôi!
            </p>
            <div className="social-icons d-flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.2, rotate: 10, backgroundColor: '#00e5ff' }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      width: '45px',
                      height: '45px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Icon size={24} />
                  </motion.a>
                );
              })}
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="fw-bold mb-4 text-info">Khám Phá</h5>
            <ul className="list-unstyled">
              {['Trang Chủ', 'Giới Thiệu', 'Tin Tức', 'Cửa Hàng', 'Liên Hệ'].map((text, i) => (
                <li key={i} className="mb-2">
                  <Link to={['/', '/about', '/news', '/shop', '/contact'][i]} className="text-white-50 text-decoration-none hover-text-info transition-all">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="fw-bold mb-4 text-info">Trạng Thái Máy Chủ</h5>
            <div className="p-3 rounded bg-white bg-opacity-10 border border-white border-opacity-10 shadow-sm">
              <div className="mb-2">
                <span className="small text-white-50 d-block">IP SERVER:</span>
                <span className="fw-black text-info user-select-all">{siteSettings?.server_ip || 'play.buildnchill.vn'}</span>
              </div>
              <div className="mb-2">
                <span className="small text-white-50 d-block">PHIÊN BẢN:</span>
                <span className="fw-bold text-white">{serverStatus?.version || '1.20.4'}</span>
              </div>
              <div>
                <span className={`badge ${serverStatus?.status === 'Online' ? 'bg-success' : 'bg-danger'} rounded-pill px-3`}>
                  {serverStatus?.status === 'Online' ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="fw-bold mb-4 text-info">Hỗ Trợ 24/7</h5>
            <ul className="list-unstyled">
              <li className="mb-3">
                <div className="small text-white-50">Email:</div>
                <a href={`mailto:${siteSettings?.contact_email}`} className="text-white text-decoration-none fw-bold">
                  {siteSettings?.contact_email || 'admin@buildnchill.vn'}
                </a>
              </li>
              <li>
                <div className="small text-white-50">Zalo/Hotline:</div>
                <a href={`tel:${siteSettings?.contact_phone}`} className="text-white text-decoration-none fw-bold">
                  {siteSettings?.contact_phone || '0123.456.789'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-white opacity-10" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0 small text-white-50">
              &copy; {new Date().getFullYear()} <span className="text-info fw-bold">{siteSettings?.site_title || 'BuildnChill'}</span>. Tận hưởng mùa hè rực rỡ! 🌊🐬
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="small text-white-50">
              Phát triển bởi <span className="text-info fw-black letter-spacing-1">T-Dev29</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;