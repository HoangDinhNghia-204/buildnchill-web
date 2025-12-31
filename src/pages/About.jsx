import { motion } from 'framer-motion';
import { BiServer, BiCube, BiGroup, BiTrophy, BiShield, BiHeart } from 'react-icons/bi';

const About = () => {
  const features = [
    { icon: BiServer, title: 'Hoạt Động 24/7', description: 'Server của chúng tôi luôn online và sẵn sàng cho bạn chơi.' },
    { icon: BiCube, title: 'Xây Dựng Sáng Tạo', description: 'Thể hiện kỹ năng xây dựng của bạn trong thế giới sáng tạo của chúng tôi.' },
    { icon: BiGroup, title: 'Cộng Đồng Năng Động', description: 'Tham gia cùng hàng nghìn người chơi từ khắp nơi trên thế giới.' },
    { icon: BiTrophy, title: 'Sự Kiện Thường Xuyên', description: 'Tham gia các cuộc thi xây dựng và sự kiện cộng đồng.' },
    { icon: BiShield, title: 'Môi Trường An Toàn', description: 'Không khoan nhượng với hành vi phá hoại và độc hại.' },
    { icon: BiHeart, title: 'Đội Ngũ Thân Thiện', description: 'Đội ngũ tận tâm của chúng tôi làm việc 24/7 để giúp đỡ bạn.' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="container my-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <motion.h1 
              className="mb-4 text-center"
              style={{ 
                background: 'linear-gradient(135deg, #dc2626 0%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '3rem', 
                fontWeight: 900 
              }}
            >
              About BuildnChill
            </motion.h1>
            
            <motion.div 
              className="glass p-4 mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="mb-3" style={{ color: '#fbbf24' }}>Welcome to Our Community</h3>
              <p style={{ color: '#b0b0b0', fontSize: '1.1rem', lineHeight: '1.8' }}>
                BuildnChill is a friendly and welcoming Minecraft server where players of all skill levels 
                can come together to build, explore, and have fun. Our mission is to create a positive 
                gaming environment where creativity thrives and friendships are formed.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="mb-4 text-center" style={{ color: '#fbbf24', fontSize: '2rem', fontWeight: 700 }}>
                What We Offer
              </h3>
              <div className="row g-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div 
                      key={index}
                      className="col-md-6"
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -10 }}
                    >
                      <div className="card glass h-100 p-4">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon size={50} style={{ color: '#d97706', marginBottom: '1rem' }} />
                        </motion.div>
                        <h5 style={{ color: '#d97706', marginBottom: '1rem', fontWeight: 700 }}>{feature.title}</h5>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{feature.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div 
              className="glass p-4 mt-5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="mb-3" style={{ color: '#d97706', fontWeight: 700 }}>Giá Trị Của Chúng Tôi</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', fontWeight: 500 }}>
                Tại BuildnChill, chúng tôi tin vào sự tôn trọng, sáng tạo và niềm vui. Chúng tôi có chính sách 
                không khoan nhượng với hành vi phá hoại, gian lận và độc hại. Đội ngũ nhân viên tận tâm của chúng tôi 
                làm việc 24/7 để đảm bảo mọi người có trải nghiệm tuyệt vời.
              </p>
            </motion.div>

            <motion.div 
              className="glass p-4 mt-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="mb-3" style={{ color: '#d97706', fontWeight: 700 }}>Tham Gia Ngay Hôm Nay</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', fontWeight: 500 }}>
                Dù bạn là một người chơi Minecraft dày dạn kinh nghiệm hay chỉ mới bắt đầu hành trình, BuildnChill 
                chào đón bạn. Kết nối với server của chúng tôi tại <strong style={{ color: '#d97706' }}>play.buildnchill.com</strong> và bắt đầu 
                cuộc phiêu lưu của bạn ngay hôm nay!
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
