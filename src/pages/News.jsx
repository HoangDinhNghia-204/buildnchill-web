import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useData } from '../context/DataContext';
import { BiSearch, BiCalendar, BiChevronLeft, BiChevronRight, BiNews } from 'react-icons/bi';
import SummerEffect from '../components/SummerEffect';
import '../styles/summer-theme.css';

const News = () => {
  const { news } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredNews = news.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredPost = filteredNews[0];
  const olderPosts = filteredNews.slice(1);

  const totalPages = Math.ceil(olderPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = olderPosts.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="shop-summer-container min-vh-100 py-5">
      <SummerEffect />
      <Helmet>
        <title>Tin Tức & Sự Kiện - BuildnChill Ocean</title>
      </Helmet>
      
      <div className="container position-relative" style={{ zIndex: 10 }}>
        <motion.div 
          className="text-center mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="summer-title display-3">TIN TỨC SỰ KIỆN 📢</h1>
          <p className="fw-bold text-primary">Cập nhật những hoạt động mới nhất từ hành trình đại dương</p>
        </motion.div>

        <motion.div
          className="search-bar mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="summer-glass p-3 shadow-xl border-0 bg-white bg-opacity-60">
            <div className="d-flex align-items-center px-3">
              <BiSearch size={28} className="text-info me-3" />
              <input
                type="text"
                className="summer-input w-100 border-0 shadow-none bg-transparent"
                placeholder="Tìm kiếm tin tức, sự kiện..."
                style={{ fontSize: '1.2rem' }}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </motion.div>

        {featuredPost && (
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="summer-glass p-0 overflow-hidden shadow-2xl border-0 bg-white">
              <div className="row g-0">
                <div className="col-lg-7">
                  <motion.div className="h-100 overflow-hidden">
                    <img
                      src={featuredPost.image}
                      className="img-fluid w-100 h-100 object-fit-cover"
                      alt={featuredPost.title}
                      style={{ minHeight: '400px' }}
                    />
                  </motion.div>
                </div>
                <div className="col-lg-5">
                  <div className="p-4 p-md-5 d-flex flex-column h-100">
                    <div className="badge bg-info px-3 py-2 rounded-pill mb-4 shadow-sm align-self-start">
                      <BiNews className="me-1" /> TIN NỔI BẬT
                    </div>
                    <h2 className="fw-black text-primary mb-3 display-6">{featuredPost.title}</h2>
                    <div className="small fw-bold text-muted mb-4 d-flex align-items-center gap-2">
                      <BiCalendar className="text-info" />
                      {new Date(featuredPost.date).toLocaleDateString('vi-VN')}
                    </div>
                    <p className="fw-bold text-muted leading-relaxed mb-5 flex-grow-1" style={{ fontSize: '1.1rem' }}>
                      {featuredPost.description}
                    </p>
                    <Link to={`/news/${featuredPost.slug || featuredPost.id}`} className="summer-button py-3 shadow-lg">
                      ĐỌC CHI TIẾT 📖
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="d-flex align-items-center gap-3 mb-5">
             <div className="flex-grow-1 border-bottom border-info border-opacity-20"></div>
             <h3 className="fw-black text-primary m-0">TẤT CẢ BÀI VIẾT</h3>
             <div className="flex-grow-1 border-bottom border-info border-opacity-20"></div>
          </div>
          
          <div className="row g-4">
            {paginatedPosts.map((post) => (
              <motion.div
                key={post.id}
                className="col-md-6 col-lg-4"
                variants={itemVariants}
                whileHover={{ y: -12 }}
              >
                <div className="summer-glass h-100 p-0 overflow-hidden shadow-xl border-0 bg-white d-flex flex-column">
                  <div className="overflow-hidden position-relative" style={{ height: '220px' }}>
                    <img
                      src={post.image}
                      className="w-100 h-100 object-fit-cover transition-all duration-500"
                      alt={post.title}
                    />
                    <div className="position-absolute top-0 end-0 m-3 badge bg-white text-info shadow-sm fw-bold">
                       {new Date(post.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="p-4 flex-grow-1 d-flex flex-column">
                    <h5 className="fw-black text-primary mb-3 text-truncate-2" style={{ height: '3.2rem', lineHeight: '1.6' }}>
                      {post.title}
                    </h5>
                    <p className="fw-bold text-muted small mb-4 text-truncate-3 opacity-80" style={{ flexGrow: 1 }}>
                      {post.description}
                    </p>
                    <Link to={`/news/${post.slug || post.id}`} className="summer-button-outline w-100 py-2 mt-auto">
                      CHI TIẾT →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {totalPages > 1 && (
          <motion.div
            className="d-flex justify-content-center align-items-center gap-3 mt-5 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              className="summer-button-outline py-2 px-4 rounded-pill"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <BiChevronLeft size={24} /> Trước
            </button>
            <span className="fw-black text-primary">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className="summer-button-outline py-2 px-4 rounded-pill"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Sau <BiChevronRight size={24} />
            </button>
          </motion.div>
        )}

        {filteredNews.length === 0 && (
          <div className="text-center py-5">
            <div className="display-1 opacity-10 mb-4">🏝️</div>
            <h4 className="fw-bold text-muted">Không tìm thấy tin tức nào phù hợp.</h4>
            <button onClick={() => setSearchQuery('')} className="btn btn-link text-info fw-bold text-decoration-none">Xem tất cả tin tức</button>
          </div>
        )}
      </div>
      
      <div className="summer-item" style={{ top: '25%', left: '5%', fontSize: '50px', opacity: 0.4 }}>⛵</div>
    </div>
  );
};

export default News;
