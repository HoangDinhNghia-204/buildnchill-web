import { motion } from 'framer-motion';
import { BiServer, BiCube, BiGroup, BiTrophy, BiShield, BiHeart } from 'react-icons/bi';

const About = () => {
  const features = [
    { icon: BiServer, title: '24/7 Uptime', description: 'Our servers are always online and ready for you to play.' },
    { icon: BiCube, title: 'Creative Building', description: 'Showcase your building skills in our creative worlds.' },
    { icon: BiGroup, title: 'Active Community', description: 'Join thousands of players from around the world.' },
    { icon: BiTrophy, title: 'Regular Events', description: 'Participate in build contests and community events.' },
    { icon: BiShield, title: 'Safe Environment', description: 'Zero tolerance for griefing and toxic behavior.' },
    { icon: BiHeart, title: 'Friendly Staff', description: 'Our dedicated team works around the clock to help you.' }
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
                          <Icon size={50} style={{ color: '#fbbf24', marginBottom: '1rem' }} />
                        </motion.div>
                        <h5 style={{ color: '#fbbf24', marginBottom: '1rem' }}>{feature.title}</h5>
                        <p style={{ color: '#b0b0b0' }}>{feature.description}</p>
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
              <h3 className="mb-3" style={{ color: '#fbbf24' }}>Our Values</h3>
              <p style={{ color: '#b0b0b0', fontSize: '1.1rem', lineHeight: '1.8' }}>
                At BuildnChill, we believe in respect, creativity, and having fun. We have a zero-tolerance 
                policy for griefing, cheating, and toxic behavior. Our dedicated staff team works around 
                the clock to ensure everyone has a great experience.
              </p>
            </motion.div>

            <motion.div 
              className="glass p-4 mt-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="mb-3" style={{ color: '#fbbf24' }}>Join Us Today</h3>
              <p style={{ color: '#d1d5db', fontSize: '1.1rem', lineHeight: '1.8' }}>
                Whether you're a seasoned Minecraft veteran or just starting your journey, BuildnChill 
                welcomes you. Connect to our server at <strong style={{ color: '#fbbf24' }}>play.buildnchill.com</strong> and start 
                your adventure today!
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
