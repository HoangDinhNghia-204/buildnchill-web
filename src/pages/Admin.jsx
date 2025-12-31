import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import RichTextEditor from '../components/RichTextEditor';
import { 
  BiBarChart, 
  BiNews, 
  BiServer, 
  BiCog, 
  BiPlus, 
  BiEdit, 
  BiTrash,
  BiLogOutCircle,
  BiCheckCircle,
  BiXCircle,
  BiEnvelope,
  BiCheck
} from 'react-icons/bi';

const Admin = () => {
  const navigate = useNavigate();
  const { 
    news, 
    serverStatus, 
    contacts,
    siteSettings,
    isAuthenticated, 
    logout,
    addNews, 
    updateNews, 
    deleteNews,
    updateServerStatus,
    updateSiteSettings,
    markContactAsRead,
    deleteContact
  } = useData();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [serverForm, setServerForm] = useState({
    status: 'Online',
    players: '',
    maxPlayers: '500',
    version: '1.20.4',
    uptime: '99.9%'
  });
  const [settingsForm, setSettingsForm] = useState({
    server_ip: '',
    server_version: '',
    contact_email: '',
    contact_phone: '',
    discord_url: '',
    site_title: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setServerForm(serverStatus);
    if (siteSettings) {
      setSettingsForm({
        server_ip: siteSettings.server_ip || '',
        server_version: siteSettings.server_version || '',
        contact_email: siteSettings.contact_email || '',
        contact_phone: siteSettings.contact_phone || '',
        discord_url: siteSettings.discord_url || '',
        site_title: siteSettings.site_title || ''
      });
    }
  }, [isAuthenticated, navigate, serverStatus, siteSettings]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleServerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServerForm({
      ...serverForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsForm({
      ...settingsForm,
      [name]: value
    });
  };

  const handleSettingsSave = async () => {
    try {
      const success = await updateSiteSettings(settingsForm);
      if (success) {
        alert('Đã cập nhật cài đặt thành công!');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };


  const handleAddNew = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image: post.image,
      date: post.date,
      description: post.description
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingPost) {
        const updatedPost = { ...editingPost, ...formData };
        const success = await updateNews(editingPost.id, updatedPost);
        if (success) {
          setShowModal(false);
          setEditingPost(null);
        }
      } else {
        const success = await addNews(formData);
        if (success) {
          setShowModal(false);
          setEditingPost(null);
        }
      }
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      await deleteNews(postId);
    }
  };

  const handleServerSave = async () => {
    try {
      const success = await updateServerStatus(serverForm);
      if (success) {
        alert('Đã cập nhật trạng thái server thành công!');
      }
    } catch (error) {
      console.error('Error updating server status:', error);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: 'dashboard', label: 'Bảng Điều Khiển', icon: BiBarChart },
    { id: 'news', label: 'Tin Tức', icon: BiNews },
    { id: 'contacts', label: 'Liên Hệ', icon: BiEnvelope },
    { id: 'server', label: 'Trạng Thái Server', icon: BiServer },
    { id: 'settings', label: 'Cài Đặt', icon: BiCog }
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Navigation Bar (for screens < 992px) */}
      <div className="admin-top-nav d-lg-none">
        <div className="admin-top-nav-header">
          <h4 style={{ 
            background: 'linear-gradient(135deg, #dc2626 0%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            margin: 0
          }}>{siteSettings?.site_title || 'BuildnChill'} Admin</h4>
        </div>
        <nav className="admin-top-nav-menu">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                className={`admin-top-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
                <span className="admin-top-nav-label">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>
        <div className="admin-top-nav-footer">
          <motion.button
            className="tet-button w-100"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <BiLogOutCircle className="me-2" />
            Đăng Xuất
          </motion.button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="d-flex d-lg-flex" style={{ minHeight: '100vh' }}>
        {/* Sidebar (Desktop only - >= 992px) */}
        <motion.div 
          className="admin-sidebar d-none d-lg-block"
          style={{ width: '250px' }}
        >
          <div className="p-3 mb-4">
            <h4 style={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              margin: 0
            }}>{siteSettings?.site_title || 'BuildnChill'} Admin</h4>
          </div>
          <nav className="nav flex-column">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                  {tab.label}
                </motion.button>
              );
            })}
          </nav>
          <div className="p-3 mt-auto">
            <motion.button
              className="tet-button w-100"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BiLogOutCircle className="me-2" />
              Đăng Xuất
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <div className="admin-content flex-grow-1">
          <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="mb-4" style={{ color: '#fbbf24', wordWrap: 'break-word' }}>Bảng Điều Khiển</h1>
              <div className="row g-3 g-md-4">
                <div className="col-12 col-sm-6 col-md-4">
                  <div className="admin-card glass">
                    <h3 style={{ color: '#fbbf24', fontSize: '2.5rem', marginBottom: '0.5rem', wordWrap: 'break-word' }}>
                      {news.length}
                    </h3>
                    <p style={{ color: '#d1d5db', wordWrap: 'break-word' }}>Tổng Số Bài Viết</p>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <div className="admin-card glass">
                    <h3 style={{ color: '#fbbf24', fontSize: '2.5rem', marginBottom: '0.5rem', wordWrap: 'break-word' }}>
                      {serverStatus?.players || 0}
                    </h3>
                    <p style={{ color: '#d1d5db', wordWrap: 'break-word' }}>Người Chơi Hiện Tại</p>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <div className="admin-card glass">
                    <h3 style={{ color: '#fbbf24', fontSize: '2.5rem', marginBottom: '0.5rem', wordWrap: 'break-word' }}>
                      {serverStatus?.uptime || '99.9%'}
                    </h3>
                    <p style={{ color: '#d1d5db', wordWrap: 'break-word' }}>Thời Gian Hoạt Động</p>
                  </div>
                </div>
              </div>
              <div className="admin-card glass mt-4">
                <h3 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Hoạt Động Gần Đây</h3>
                <p style={{ color: '#d1d5db' }}>Tổng quan và thống kê sẽ được hiển thị tại đây.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'news' && (
            <motion.div
              key="news"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <h1 style={{ color: '#d97706', fontWeight: 800, wordWrap: 'break-word', margin: 0 }}>Quản Lý Tin Tức</h1>
                <motion.button
                  className="tet-button"
                  onClick={handleAddNew}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <BiPlus className="me-2" />
                  Thêm Bài Viết Mới
                </motion.button>
              </div>

              <div className="admin-table glass">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tiêu Đề</th>
                      <th>Ngày</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center" style={{ color: '#d1d5db', padding: '2rem' }}>
                          Chưa có bài viết nào
                        </td>
                      </tr>
                    ) : (
                      news.map((post) => (
                        <motion.tr
                          key={post.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.05)' }}
                        >
                          <td style={{ wordWrap: 'break-word', maxWidth: '300px' }}>{post.title}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{new Date(post.date).toLocaleDateString('vi-VN')}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <motion.button
                              className="tet-button-outline me-2"
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                              onClick={() => handleEdit(post)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <BiEdit className="me-1" />
                              Sửa
                            </motion.button>
                            <motion.button
                              className="tet-button-outline"
                              style={{ 
                                padding: '0.25rem 0.75rem', 
                                fontSize: '0.875rem',
                                borderColor: '#f97316',
                                color: '#f97316'
                              }}
                              onClick={() => handleDelete(post.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <BiTrash className="me-1" />
                              Xóa
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <h1 style={{ color: '#fbbf24', wordWrap: 'break-word', margin: 0 }}>Tin Nhắn Liên Hệ</h1>
                <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                  <span style={{ color: '#d1d5db' }}>
                    Tổng: {contacts.length} | 
                    Chưa đọc: {contacts.filter(c => !c.read).length}
                  </span>
                </div>
              </div>

              <div className="admin-table glass">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên Game</th>
                      <th>Email</th>
                      <th>Số Điện Thoại</th>
                      <th>Chủ Đề</th>
                      <th>Ngày</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center" style={{ color: '#d1d5db', padding: '2rem' }}>
                          Chưa có liên hệ nào
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <motion.tr
                          key={contact.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.05)' }}
                          style={{ 
                            backgroundColor: contact.read ? 'transparent' : 'rgba(251, 191, 36, 0.1)',
                            borderLeft: contact.read ? 'none' : '3px solid #fbbf24'
                          }}
                        >
                          <td style={{ fontWeight: contact.read ? 'normal' : '600', wordWrap: 'break-word', maxWidth: '150px' }}>
                            {contact.ign}
                          </td>
                          <td style={{ wordWrap: 'break-word', maxWidth: '200px' }}>
                            <a href={`mailto:${contact.email}`} style={{ color: '#fbbf24', wordBreak: 'break-all' }}>
                              {contact.email}
                            </a>
                          </td>
                          <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{contact.phone || '-'}</td>
                          <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{contact.subject}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {new Date(contact.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {contact.read ? (
                              <span style={{ color: '#d1d5db' }}>Đã đọc</span>
                            ) : (
                              <span style={{ color: '#fbbf24', fontWeight: '600' }}>Mới</span>
                            )}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <motion.button
                              className="tet-button-outline me-2 mb-2 mb-md-0"
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                              onClick={() => {
                                const message = `Tên Game: ${contact.ign}\nEmail: ${contact.email}\nSố Điện Thoại: ${contact.phone || 'N/A'}\nChủ Đề: ${contact.subject}\n\nNội Dung:\n${contact.message}`;
                                alert(message);
                                if (!contact.read) {
                                  markContactAsRead(contact.id);
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <BiCheck className="me-1" />
                              {contact.read ? 'Xem' : 'Đánh dấu đã đọc'}
                            </motion.button>
                            <motion.button
                              className="tet-button-outline"
                              style={{ 
                                padding: '0.25rem 0.75rem', 
                                fontSize: '0.875rem',
                                borderColor: '#f97316',
                                color: '#f97316',
                                whiteSpace: 'nowrap'
                              }}
                              onClick={() => {
                                if (window.confirm('Bạn có chắc muốn xóa liên hệ này?')) {
                                  deleteContact(contact.id);
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <BiTrash className="me-1" />
                              Xóa
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'server' && (
            <motion.div
              key="server"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="mb-4" style={{ color: '#fbbf24', wordWrap: 'break-word' }}>Trạng Thái Server</h1>
              <div className="admin-card glass">
                <div className="mb-4">
                  <label className="form-label">Trạng Thái Server</label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="status"
                      checked={serverForm.status === 'Online'}
                      onChange={(e) => setServerForm({
                        ...serverForm,
                        status: e.target.checked ? 'Online' : 'Offline'
                      })}
                    />
                    <label className="form-check-label ms-3" style={{ color: '#d1d5db' }}>
                      {serverForm.status === 'Online' ? 'Đang Hoạt Động' : 'Đang Tắt'}
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Số Người Chơi Hiện Tại</label>
                  <input
                    type="number"
                    className="form-control"
                    name="players"
                    value={serverForm.players}
                    onChange={handleServerChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Số Người Chơi Tối Đa</label>
                  <input
                    type="number"
                    className="form-control"
                    name="maxPlayers"
                    value={serverForm.maxPlayers}
                    onChange={handleServerChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Phiên Bản</label>
                  <input
                    type="text"
                    className="form-control"
                    name="version"
                    value={serverForm.version}
                    onChange={handleServerChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Thời Gian Hoạt Động</label>
                  <input
                    type="text"
                    className="form-control"
                    name="uptime"
                    value={serverForm.uptime}
                    onChange={handleServerChange}
                  />
                </div>
                <motion.button
                  className="tet-button"
                  onClick={handleServerSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiCheckCircle className="me-2" />
                  Lưu Thay Đổi
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="mb-4" style={{ color: '#d97706', fontWeight: 800, wordWrap: 'break-word' }}>Cài Đặt Website</h1>
              <div className="admin-card glass">
                <div className="mb-4">
                  <label className="form-label">Tiêu Đề Website</label>
                  <input
                    type="text"
                    className="form-control"
                    name="site_title"
                    value={settingsForm.site_title}
                    onChange={handleSettingsChange}
                    placeholder="BuildnChill"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">IP Server</label>
                  <input
                    type="text"
                    className="form-control"
                    name="server_ip"
                    value={settingsForm.server_ip}
                    onChange={handleSettingsChange}
                    placeholder="play.buildnchill.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Phiên Bản Server</label>
                  <input
                    type="text"
                    className="form-control"
                    name="server_version"
                    value={settingsForm.server_version}
                    onChange={handleSettingsChange}
                    placeholder="1.20.4"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Email Liên Hệ</label>
                  <input
                    type="email"
                    className="form-control"
                    name="contact_email"
                    value={settingsForm.contact_email}
                    onChange={handleSettingsChange}
                    placeholder="contact@buildnchill.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Số Điện Thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="contact_phone"
                    value={settingsForm.contact_phone}
                    onChange={handleSettingsChange}
                    placeholder="+1 (234) 567-890"
                  />
                </div>
                <motion.button
                  className="tet-button"
                  onClick={handleSettingsSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiCheckCircle className="me-2" />
                  Lưu Cài Đặt
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Modal for Add/Edit News */}
      {showModal && (
        <motion.div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="modal-dialog modal-lg"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
          >
            <div className="modal-content glass-strong" style={{ border: '2px solid #fbbf24' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <h5 className="modal-title" style={{ color: '#fbbf24' }}>
                  {editingPost ? 'Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
                </h5>
                <motion.button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPost(null);
                  }}
                  whileHover={{ rotate: 90 }}
                  style={{ filter: 'invert(1)' }}
                ></motion.button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tiêu Đề</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô Tả</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập mô tả ngắn gọn về bài viết..."
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nội Dung</label>
                  <p style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Bạn có thể dán HTML, ảnh, video, iframe và bất kỳ nội dung nào. Editor hỗ trợ đầy đủ HTML như Drupal.
                  </p>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Nhập nội dung bài viết... Bạn có thể dán HTML, ảnh, video, iframe trực tiếp vào đây."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">URL Hình Ảnh</label>
                  <input
                    type="url"
                    className="form-control"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày Đăng</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <motion.button
                  type="button"
                  className="tet-button-outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPost(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiXCircle className="me-2" />
                  Hủy
                </motion.button>
                <motion.button
                  type="button"
                  className="tet-button"
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiCheckCircle className="me-2" />
                  Lưu
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Admin;
