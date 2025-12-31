import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDiscord, FaTwitter, FaYoutube, FaTwitch } from 'react-icons/fa';
import { useData } from '../context/DataContext';

const Footer = () => {
  const { siteSettings, serverStatus } = useData();
  const socialLinks = [
    { icon: FaDiscord, href: 'https://discord.gg/buildnchill', label: 'Discord' },
    { icon: FaTwitter, href: 'https://twitter.com/buildnchill', label: 'Twitter' },
    { icon: FaYoutube, href: 'https://youtube.com/buildnchill', label: 'YouTube' },
    { icon: FaTwitch, href: 'https://twitch.tv/buildnchill', label: 'Twitch' }
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
            <h5>BuildnChill</h5>
            <p style={{ color: '#d1d5db', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Your friendly Minecraft community server. Build, explore, and chill with us! 
              Join our vibrant community and experience the best Minecraft gameplay.
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
                  >
                    <Icon size={20} />
                  </motion.a>
                );
              })}
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/about">About</Link>
              </li>
              <li className="mb-2">
                <Link to="/news">News</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Server Info</h5>
            <ul className="list-unstyled">
              <li className="mb-2" style={{ color: '#d1d5db' }}>
                <strong style={{ color: '#fbbf24' }}>IP:</strong> {siteSettings?.server_ip || 'play.buildnchill.com'}
              </li>
              <li className="mb-2" style={{ color: '#d1d5db' }}>
                <strong style={{ color: '#fbbf24' }}>Version:</strong> {siteSettings?.server_version || serverStatus?.version || '1.20.4'}
              </li>
              <li className="mb-2" style={{ color: '#d1d5db' }}>
                <strong style={{ color: '#fbbf24' }}>Status:</strong> {serverStatus?.status || 'Online'}
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Contact</h5>
            <ul className="list-unstyled">
              <li className="mb-2" style={{ color: '#d1d5db' }}>
                <strong style={{ color: '#fbbf24' }}>Email:</strong><br />
                <a href={`mailto:${siteSettings?.contact_email || 'contact@buildnchill.com'}`} style={{ color: '#d1d5db' }}>
                  {siteSettings?.contact_email || 'contact@buildnchill.com'}
                </a>
              </li>
              <li className="mb-2" style={{ color: '#d1d5db' }}>
                <strong style={{ color: '#fbbf24' }}>Phone:</strong><br />
                <a href={`tel:${siteSettings?.contact_phone?.replace(/\s/g, '') || '+1234567890'}`} style={{ color: '#d1d5db' }}>
                  {siteSettings?.contact_phone || '+1 (234) 567-890'}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <hr style={{ borderColor: 'rgba(220, 38, 38, 0.3)', margin: '2rem 0', borderWidth: '1px' }} />
        <div className="text-center">
          <p className="mb-0" style={{ color: '#d1d5db', fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} BuildnChill. All rights reserved. 
            <span style={{ color: '#fbbf24', marginLeft: '0.5rem' }}>🎊 Chúc Mừng Năm Mới! 🎊</span>
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
