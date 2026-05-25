import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useData } from '../context/DataContext';
import { BiArrowBack, BiCalendar, BiTime, BiHash } from 'react-icons/bi';
import SummerEffect from '../components/SummerEffect';
import '../styles/summer-theme.css';
import 'react-quill/dist/quill.snow.css';

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { news } = useData();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const foundPost = news.find(p => p.slug === slug || p.id.toString() === slug);
    if (foundPost) {
      setPost(foundPost);
    } else if (news.length > 0) {
      navigate('/news');
    }
  }, [slug, navigate, news]);

  if (!post) {
    return (
      <div className="shop-summer-container min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-info"></div>
      </div>
    );
  }

  return (
    <div className="shop-summer-container min-vh-100 py-5">
      <SummerEffect />
      <Helmet>
        <title>{post.title} - BuildnChill Ocean</title>
        <meta name="description" content={post.description || post.title} />
      </Helmet>

      <div className="container position-relative" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4">
            <Link to="/news" className="summer-button-outline py-2 px-4 rounded-pill d-inline-flex align-items-center gap-2 text-decoration-none">
              <BiArrowBack size={20} /> QUAY LẠI TIN TỨC
            </Link>
          </div>

          <article className="summer-glass p-0 overflow-hidden shadow-2xl border-0 bg-white">
            {/* Cover Image */}
            <div className="position-relative" style={{ maxHeight: '500px', overflow: 'hidden' }}>
              <img
                src={post.image}
                className="w-100 object-fit-cover"
                alt={post.title}
                style={{ minHeight: '300px', maxHeight: '500px' }}
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-4 p-md-5" style={{ background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)' }}>
                 <div className="badge bg-info px-3 py-2 rounded-pill mb-3 shadow-lg">SỰ KIỆN MỚI</div>
                 <h1 className="text-white fw-black display-5 m-0" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{post.title}</h1>
              </div>
            </div>

            <div className="p-4 p-md-5">
              <div className="d-flex flex-wrap gap-4 mb-5 pb-4 border-bottom border-info border-opacity-10">
                <div className="d-flex align-items-center gap-2 fw-bold text-muted">
                  <BiCalendar className="text-info" size={24} />
                  <span>Ngày đăng: {new Date(post.date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="d-flex align-items-center gap-2 fw-bold text-muted">
                  <BiTime className="text-info" size={24} />
                  <span>Thời gian đọc: 5 phút</span>
                </div>
                <div className="d-flex align-items-center gap-2 fw-bold text-muted">
                  <BiHash className="text-info" size={24} />
                  <span>BuildnChill Ocean</span>
                </div>
              </div>

              <div className="news-content ql-snow">
                <div 
                   className="ql-editor p-0 fw-bold text-muted leading-relaxed" 
                   style={{ fontSize: '1.15rem', color: '#475569' }}
                   dangerouslySetInnerHTML={{ __html: post.content }} 
                />
              </div>

              <div className="mt-5 pt-5 border-top border-info border-opacity-10 text-center">
                 <h4 className="fw-black text-primary mb-4">CHIA SẺ TIN TỨC NÀY</h4>
                 <div className="d-flex justify-content-center gap-3">
                    <button className="summer-button py-2 px-4 shadow-sm" style={{ background: '#1877F2' }}>FACEBOOK</button>
                    <button className="summer-button py-2 px-4 shadow-sm" style={{ background: '#25D366' }}>ZALO</button>
                 </div>
              </div>
            </div>
          </article>
        </motion.div>
      </div>

      <div className="summer-item dolphin" style={{ top: '30%', right: '-30px' }}>🐬</div>
    </div>
  );
};

export default NewsDetail;
