import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BiUser, BiEnvelope, BiPhone, BiMessageSquare, BiSend, BiImageAdd, BiX, BiSupport } from 'react-icons/bi';
import { useData } from '../context/DataContext';
import SummerEffect from '../components/SummerEffect';
import '../styles/summer-theme.css';

const Contact = () => {
  const { submitContact } = useData();
  const [formData, setFormData] = useState({
    ign: '',
    email: '',
    phone: '',
    category: '',
    message: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'report', label: 'Báo Cáo Người Chơi (Report)' },
    { value: 'help', label: 'Hỗ Trợ Tài Khoản (Help)' },
    { value: 'bug', label: 'Báo Lỗi Kỹ Thuật (Bug)' },
    { value: 'suggestion', label: 'Đóng Góp Ý Tưởng (Suggestion)' },
    { value: 'other', label: 'Vấn Đề Khác (Other)' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 10MB!');
        return;
      }
      setFormData({
        ...formData,
        image: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploading(true);

    try {
      const selectedCategory = categories.find(cat => cat.value === formData.category);
      const submissionData = {
        ...formData,
        subject: selectedCategory ? selectedCategory.label : 'Liên hệ mới'
      };
      
      const success = await submitContact(submissionData);
      if (success) {
        alert('Yêu cầu đã được gửi! Đội ngũ hỗ trợ sẽ phản hồi bạn sớm nhất qua Email. 🌊');
        setFormData({ ign: '', email: '', phone: '', category: '', message: '', image: null });
        setImagePreview(null);
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
      } else {
        alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau hoặc liên hệ Admin qua Discord! 🛑');
      }
    } catch (error) {
      console.error('Error submitting contact:', error);
      alert('Lỗi hệ thống: ' + (error.message || 'Không thể kết nối máy chủ.'));
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const formFields = [
    { name: 'ign', label: 'Tên Trong Game (IGN)', icon: BiUser, type: 'text', required: true },
    { name: 'email', label: 'Địa Chỉ Email', icon: BiEnvelope, type: 'email', required: true },
    { name: 'phone', label: 'Số Điện Thoại (Zalo)', icon: BiPhone, type: 'tel', required: false }
  ];

  return (
    <div className="shop-summer-container min-vh-100 py-5">
      <SummerEffect />
      <Helmet>
        <title>Hỗ Trợ & Liên Hệ - BuildnChill Ocean</title>
      </Helmet>
      
      <div className="container position-relative" style={{ zIndex: 10 }}>
        <motion.div
          className="row"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-lg-8 mx-auto">
            <div className="text-center mb-5">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="d-inline-block mb-3 bg-white p-3 rounded-circle shadow-lg border-2 border-info"
              >
                <BiSupport size={50} className="text-info" />
              </motion.div>
              <h1 className="summer-title display-4">TRUNG TÂM HỖ TRỢ ⚓</h1>
              <p className="fw-bold text-primary">Chúng tôi luôn lắng nghe và sẵn sàng giúp đỡ bạn trong hành trình đại dương!</p>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              className="summer-glass p-4 p-md-5 shadow-2xl border-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="row g-4">
                {formFields.map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <motion.div
                      key={field.name}
                      className="col-md-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <label htmlFor={field.name} className="summer-label d-flex align-items-center gap-2">
                        <Icon size={20} className="text-info" />
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        className="summer-input w-100"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={`Nhập ${field.label.toLowerCase()}...`}
                        required={field.required}
                      />
                    </motion.div>
                  );
                })}

                <motion.div
                  className="col-md-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="category" className="summer-label d-flex align-items-center gap-2">
                    <BiMessageSquare size={20} className="text-info" />
                    Danh Mục Hỗ Trợ
                  </label>
                  <select
                    className="summer-select w-100"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn vấn đề cần giúp --</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  className="col-12"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label htmlFor="message" className="summer-label d-flex align-items-center gap-2">
                    <BiMessageSquare size={20} className="text-info" />
                    Nội Dung Chi Tiết
                  </label>
                  <textarea
                    className="summer-input w-100"
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Hãy mô tả vấn đề của bạn một cách chi tiết nhất..."
                    rows="5"
                    required
                    style={{ minHeight: '150px', resize: 'vertical' }}
                  ></textarea>
                </motion.div>

                <motion.div
                  className="col-12"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label htmlFor="image" className="summer-label d-flex align-items-center gap-2">
                    <BiImageAdd size={20} className="text-info" />
                    Đính Kèm Ảnh Minh Chứng (Nếu có)
                  </label>
                  <div className="summer-glass p-4 text-center border-dashed border-2 cursor-pointer transition-all bg-white bg-opacity-30" onClick={() => document.getElementById('image').click()}>
                     {imagePreview ? (
                        <div className="position-relative d-inline-block">
                           <img src={imagePreview} alt="Preview" className="rounded-4 shadow-lg border border-4 border-white" style={{ maxWidth: '100%', height: '180px', objectFit: 'cover' }} />
                           <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }} className="position-absolute top-0 end-0 m-2 btn btn-danger btn-sm rounded-circle shadow">
                              <BiX size={20} />
                           </button>
                        </div>
                     ) : (
                        <div className="text-muted py-3">
                           <BiImageAdd size={40} className="mb-2 opacity-50" />
                           <div className="fw-bold">Nhấn để tải ảnh hoặc screenshot</div>
                           <small>Chấp nhận: PNG, JPG (Max 10MB)</small>
                        </div>
                     )}
                     <input type="file" id="image" name="image" className="d-none" accept="image/*" onChange={handleImageChange} />
                  </div>
                </motion.div>

                <div className="col-12 mt-3">
                  <motion.button
                    type="submit"
                    className="summer-button w-100 py-4 shadow-xl"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={submitting || uploading}
                  >
                    <BiSend size={24} className="me-2" />
                    {(submitting || uploading) ? 'ĐANG GỬI YÊU CẦU...' : 'GỬI THÔNG TIN HỖ TRỢ 🚀'}
                  </motion.button>
                </div>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>

      <div className="summer-item dolphin" style={{ top: '20%', right: '-30px' }}>🐬</div>
      <div className="summer-item" style={{ bottom: '10%', left: '5%', fontSize: '45px' }}>🍹</div>
    </div>
  );
};

export default Contact;
