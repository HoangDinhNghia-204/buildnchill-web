import { useState } from 'react';
import { motion } from 'framer-motion';
import { BiUser, BiEnvelope, BiPhone, BiMessageSquare, BiSend } from 'react-icons/bi';
import { useData } from '../context/DataContext';

const Contact = () => {
  const { submitContact } = useData();
  const [formData, setFormData] = useState({
    ign: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const success = await submitContact(formData);
      if (success) {
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể. 🎊');
        setFormData({
          ign: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error submitting contact:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = [
    { name: 'ign', label: 'Tên Trong Game (IGN)', icon: BiUser, type: 'text', required: true },
    { name: 'email', label: 'Email', icon: BiEnvelope, type: 'email', required: true },
    { name: 'phone', label: 'Số Điện Thoại', icon: BiPhone, type: 'tel', required: false },
    { name: 'subject', label: 'Chủ Đề', icon: BiMessageSquare, type: 'text', required: true }
  ];

  return (
    <div className="container my-5">
      <motion.div 
        className="row"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="col-lg-8 mx-auto">
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
            Liên Hệ Chúng Tôi
          </motion.h1>
          <motion.p 
            className="mb-5 text-center"
            style={{ color: '#d1d5db', fontSize: '1.1rem' }}
          >
            Have a question or need help? Fill out the form below and we'll get back to you as soon as possible.
          </motion.p>

          <motion.form 
            onSubmit={handleSubmit}
            className="glass p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {formFields.map((field, index) => {
              const Icon = field.icon;
              return (
                <motion.div 
                  key={field.name}
                  className="mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <label htmlFor={field.name} className="form-label">
                    <Icon className="me-2" style={{ color: '#d97706' }} />
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    className="form-control"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.label}
                    required={field.required}
                  />
                </motion.div>
              );
            })}

            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="message" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                <BiMessageSquare className="me-2" style={{ color: '#d97706' }} />
                Tin Nhắn
              </label>
              <textarea
                className="form-control"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Nhập tin nhắn của bạn..."
                rows="5"
                required
                style={{ minHeight: '150px', resize: 'vertical' }}
              ></textarea>
            </motion.div>

            <motion.button 
              type="submit" 
              className="tet-button w-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              <BiSend className="me-2" />
              {submitting ? 'Đang Gửi...' : 'Gửi Tin Nhắn'}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
