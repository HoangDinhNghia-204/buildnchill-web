import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BiServer, BiCube, BiGroup, BiTrophy, BiShield, BiHeart, BiAnchor, BiCompass } from 'react-icons/bi';
import { useData } from '../context/DataContext';
import SummerEffect from '../components/SummerEffect';
import '../styles/summer-theme.css';

const About = () => {
  const { siteSettings } = useData();
  const features = [
    { icon: BiServer, title: 'Hoạt Động 24/7', description: 'Hệ thống máy chủ luôn sẵn sàng phục vụ hành trình của bạn mọi lúc.' },
    { icon: BiCube, title: 'Xây Dựng Sáng Tạo', description: 'Thể hiện bản thân qua những công trình kỳ vĩ giữa đại dương xanh.' },
    { icon: BiGroup, title: 'Cộng Đồng Vui Vẻ', description: 'Nơi kết nối hàng ngàn trái tim cùng đam mê Minecraft Việt Nam.' },
    { icon: BiTrophy, title: 'Sự Kiện Mùa Hè', description: 'Tham gia các cuộc thi thú vị với phần quà hấp dẫn mỗi tuần.' },
    { icon: BiShield, title: 'Môi Trường An Toàn', description: 'Luôn bảo vệ người chơi khỏi các hành vi gian lận và độc hại.' },
    { icon: BiHeart, title: 'Hỗ Trợ Tận Tâm', description: 'Đội ngũ trực chiến hỗ trợ bạn giải quyết mọi vấn đề nhanh chóng.' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="shop-summer-container min-vh-100 py-5">
      <Helmet>
        <title>Giới Thiệu - BuildnChill Summer</title>
        <meta name="description" content="Khám phá hành trình phiêu lưu tại BuildnChill, máy chủ Minecraft mùa hè năng động nhất." />
      </Helmet>
      <SummerEffect />

      <div className="container position-relative" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <motion.div 
                   animate={{ rotate: [0, 10, -10, 0] }} 
                   transition={{ repeat: Infinity, duration: 5 }}
                   className="d-inline-block mb-3"
                >
                   <BiCompass size={60} className="text-info" />
                </motion.div>
                <h1 className="summer-title display-3 mb-3">VỀ {siteSettings?.site_title?.toUpperCase() || 'BUILDNCHILL'}</h1>
                <p className="h5 fw-bold text-primary">Khám Phá Hành Trình Đại Dương Tuyệt Vời 🌊</p>
              </div>

              <motion.div
                className="summer-glass p-4 p-md-5 mb-5 shadow-2xl border-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="fw-black text-primary mb-4 d-flex align-items-center gap-2">
                  <BiAnchor className="text-info" /> CHÀO MỪNG BẠN ĐẾN VỚI CHÚNG TÔI
                </h3>
                <p className="fw-bold text-muted leading-relaxed" style={{ fontSize: '1.1rem' }}>
                  {siteSettings?.site_title || 'BuildnChill'} là một máy chủ Minecraft tâm huyết, nơi hội tụ những tâm hồn yêu tự do và sáng tạo. 
                  Trong mùa hè này, chúng tôi mang đến một làn gió mới với thế giới đại dương bao la, những hòn đảo bí ẩn và vô vàn 
                  hoạt động hấp dẫn đang chờ bạn khám phá. Sứ mệnh của BuildnChill là tạo dựng một cộng đồng văn minh, vui vẻ và 
                  gắn kết, nơi mọi người đều có thể tỏa sáng.
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mb-5"
              >
                <h3 className="summer-title text-center mb-5" style={{ fontSize: '2rem' }}>
                  NHỮNG TRẢI NGHIỆM ĐẶC BIỆT 🐬
                </h3>
                <div className="row g-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        className="col-md-6 col-lg-4"
                        variants={itemVariants}
                        whileHover={{ y: -10 }}
                      >
                        <div className="summer-glass h-100 p-4 border-0 shadow-xl bg-white bg-opacity-80 text-center">
                          <div className="d-inline-flex p-3 rounded-4 bg-info bg-opacity-10 text-info mb-4 shadow-sm">
                            <Icon size={45} />
                          </div>
                          <h5 className="fw-black text-primary mb-3">{feature.title}</h5>
                          <p className="fw-bold text-muted small mb-0">{feature.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                className="summer-glass p-4 p-md-5 shadow-2xl border-0 bg-info bg-opacity-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="row align-items-center g-4">
                   <div className="col-md-8">
                      <h3 className="fw-black text-primary mb-3">BẮT ĐẦU CUỘC PHIÊU LƯU NGAY!</h3>
                      <p className="fw-bold text-muted m-0">
                        Đừng để mùa hè trôi qua một cách tẻ nhạt. Hãy kết nối với chúng tôi ngay hôm nay và cùng viết nên những 
                        câu chuyện huyền thoại trên biển cả. BuildnChill đang chờ đón sự xuất hiện của bạn!
                      </p>
                   </div>
                   <div className="col-md-4 text-center">
                      <div className="p-3 bg-white rounded-4 shadow-xl border-3 border-info border-dashed">
                         <div className="small fw-black text-muted mb-1">SERVER IP</div>
                         <div className="h4 fw-black text-info m-0">{siteSettings?.server_ip || 'buildnchill.id.vn'}</div>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative items */}
      <div className="summer-item" style={{ bottom: '5%', right: '5%', fontSize: '40px' }}>🐚</div>
      <div className="summer-item" style={{ top: '15%', left: '5%', fontSize: '50px' }}>🌴</div>
    </div>
  );
};

export default About;
