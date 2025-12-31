import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDiscord } from 'react-icons/fa'; // Đã bỏ các icon không dùng
import { useData } from '../context/DataContext';

const Footer = () => {
  const { siteSettings, serverStatus } = useData();
  
  // Chỉ giữ lại Discord như yêu cầu - lấy từ settings
  const socialLinks = [
    { icon: FaDiscord, href: siteSettings?.discord_url || 'https://discord.gg/buildnchill', label: 'Discord' }
  ];

  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6 mb-4">
            <h5>{siteSettings?.site_title || 'BuildnChill'}</h5>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Server Minecraft cộng đồng thân thiện của chúng tôi. Xây dựng, khám phá và thư giãn cùng chúng tôi! 
              Tham gia cộng đồng sôi động và trải nghiệm gameplay Minecraft tuyệt vời nhất.
            </p>
            <div className="social-icons">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ backgroundColor: '#5865F2', color: 'white', padding: '10px', borderRadius: '50%', display: 'inline-flex' }} // Style riêng cho Discord nổi bật
                  >
                    <Icon size={20} />
                  </motion.a>
                );
              })}
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Liên Kết Nhanh</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/">Trang Chủ</Link>
              </li>
              <li className="mb-2">
                <Link to="/about">Giới Thiệu</Link>
              </li>
              <li className="mb-2">
                <Link to="/news">Tin Tức</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact">Liên Hệ</Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Thông Tin Server</h5>
            <ul className="list-unstyled">
              <li className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#d97706' }}>IP:</strong> {siteSettings?.server_ip || 'play.buildnchill.com'}
              </li>
              <li className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#d97706' }}>Phiên Bản:</strong> {siteSettings?.server_version || serverStatus?.version || '1.20.4'}
              </li>
              <li className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#d97706' }}>Trạng Thái:</strong> {serverStatus?.status === 'Online' ? <span className="text-success fw-bold">Đang Hoạt Động</span> : <span className="text-danger">Bảo Trì</span>}
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Liên Hệ</h5>
            <ul className="list-unstyled">
              <li className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#d97706' }}>Email:</strong><br />
                <a href={`mailto:${siteSettings?.contact_email || 'contact@buildnchill.com'}`} style={{ color: 'var(--text-secondary)' }}>
                  {siteSettings?.contact_email || 'contact@buildnchill.com'}
                </a>
              </li>
              <li className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#d97706' }}>Số Điện Thoại:</strong><br />
                <a href={`tel:${siteSettings?.contact_phone?.replace(/\s/g, '') || '+1234567890'}`} style={{ color: 'var(--text-secondary)' }}>
                  {siteSettings?.contact_phone || '+1 (234) 567-890'}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Đường kẻ ngang màu cam nhạt cho hợp tông */}
        <hr style={{ borderColor: '#d97706', margin: '2rem 0', borderWidth: '1px', opacity: 0.3 }} />
        
        <div className="text-center">
          {/* Phần Copyright chỉnh đậm màu và in đậm hơn */}
          <p className="mb-2" style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
            &copy; {new Date().getFullYear()} {siteSettings?.site_title || 'BuildnChill'}. All rights reserved. 
            <span style={{ color: '#d97706', marginLeft: '0.5rem' }}>🎊 Chúc Mừng Năm Mới! 🎊</span>
          </p>

          {/* Phần Credit T-Dev29 */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '0.9rem', color: '#4b5563' }}
          >
            Website được thiết kế và quản lý bởi <span style={{ color: '#d97706', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>T-Dev29</span>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;