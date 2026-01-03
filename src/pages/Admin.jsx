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
  BiCheck,
  BiImage
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
    updateContactStatus,
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
    version: '1.20.4'
  });
  const [settingsForm, setSettingsForm] = useState({
    server_ip: '',
    server_version: '',
    contact_email: '',
    contact_phone: '',
    discord_url: '',
    site_title: ''
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Chưa Giải Quyết', color: '#fbbf24' },
    { value: 'received', label: 'Đã Nhận', color: '#3b82f6' },
    { value: 'resolved', label: 'Đã Giải Quyết', color: '#10b981' }
  ];

  const categoryLabels = {
    report: 'Báo Cáo',
    help: 'Trợ Giúp',
    bug: 'Báo Lỗi',
    suggestion: 'Đề Xuất',
    other: 'Khác'
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setServerForm({
      status: serverStatus?.status || 'Online',
      players: serverStatus?.players || '0',
      maxPlayers: serverStatus?.maxPlayers || '500',
      version: serverStatus?.version || '1.20.4'
    });
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

  // Notification for new contacts
  const unreadCount = contacts.filter(c => !c.read).length;
  const pendingCount = contacts.filter(c => c.status === 'pending' || !c.status).length;

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
            const hasNotification = tab.id === 'contacts' && (unreadCount > 0 || pendingCount > 0);
            return (
              <motion.button
                key={tab.id}
                className={`admin-top-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ position: 'relative' }}
              >
                <Icon size={18} />
                <span className="admin-top-nav-label">{tab.label}</span>
                {hasNotification && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount + pendingCount > 9 ? '9+' : unreadCount + pendingCount}
                  </span>
                )}
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
              const hasNotification = tab.id === 'contacts' && (unreadCount > 0 || pendingCount > 0);
              return (
                <motion.button
                  key={tab.id}
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ position: 'relative' }}
                >
                  <Icon size={20} />
                  {tab.label}
                  {hasNotification && (
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {unreadCount + pendingCount > 9 ? '9+' : unreadCount + pendingCount}
                    </span>
                  )}
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
              <h1 className="mb-4" style={{ color: '#d97706', fontWeight: 800, wordWrap: 'break-word' }}>Bảng Điều Khiển</h1>
              <div className="row g-3 g-md-4">
                <div className="col-12 col-sm-6 col-md-4">
                  <div className="admin-card glass">
                    <h3 style={{ color: '#d97706', fontSize: '2.5rem', marginBottom: '0.5rem', wordWrap: 'break-word' }}>
                      {news.length}
                    </h3>
                    <p style={{ color: '#1a1a1a', wordWrap: 'break-word', fontWeight: 500 }}>Tổng Số Bài Viết</p>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <div className="admin-card glass">
                    <h3 style={{ color: '#d97706', fontSize: '2.5rem', marginBottom: '0.5rem', wordWrap: 'break-word' }}>
                      {serverStatus?.players || 0}
                    </h3>
                    <p style={{ color: '#1a1a1a', wordWrap: 'break-word', fontWeight: 500 }}>Người Chơi Hiện Tại</p>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <div className="admin-card glass">
                    <h3 style={{ color: '#d97706', fontSize: '2.5rem', marginBottom: '0.5rem', wordWrap: 'break-word' }}>
                      {contacts.filter(c => !c.read || c.status === 'pending' || !c.status).length}
                    </h3>
                    <p style={{ color: '#1a1a1a', wordWrap: 'break-word', fontWeight: 500 }}>Liên Hệ Cần Xử Lý</p>
                  </div>
                </div>
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
                        <td colSpan="3" className="text-center" style={{ color: '#1a1a1a', padding: '2rem', fontWeight: 500 }}>
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
                          <td style={{ wordWrap: 'break-word', maxWidth: '300px', color: '#0a0a0a', fontWeight: 500 }}>{post.title}</td>
                          <td style={{ whiteSpace: 'nowrap', color: '#1a1a1a', fontWeight: 500 }}>{new Date(post.date).toLocaleDateString('vi-VN')}</td>
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
                <h1 style={{ color: '#d97706', fontWeight: 800, wordWrap: 'break-word', margin: 0 }}>Tin Nhắn Liên Hệ</h1>
                <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                  <span style={{ color: '#0a0a0a', fontWeight: 600 }}>
                    Tổng: {contacts.length} | 
                    Chưa đọc: {contacts.filter(c => !c.read).length} | 
                    Chưa giải quyết: {contacts.filter(c => c.status === 'pending' || !c.status).length}
                  </span>
                </div>
              </div>

              <div className="admin-table glass">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên Game</th>
                      <th>Email</th>
                      <th>Danh Mục</th>
                      <th>Chủ Đề</th>
                      <th>Ảnh</th>
                      <th>Ngày</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center" style={{ color: '#1a1a1a', padding: '2rem', fontWeight: 500 }}>
                          Chưa có liên hệ nào
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => {
                        const currentStatus = statusOptions.find(s => s.value === (contact.status || 'pending'));
                        return (
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
                            <td style={{ fontWeight: contact.read ? '500' : '700', wordWrap: 'break-word', maxWidth: '150px', color: '#0a0a0a' }}>
                              {contact.ign}
                            </td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '200px' }}>
                              <a href={`mailto:${contact.email}`} style={{ color: '#d97706', wordBreak: 'break-all', fontWeight: 500 }}>
                                {contact.email}
                              </a>
                            </td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '120px' }}>
                              <span style={{ 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '4px', 
                                backgroundColor: 'rgba(217, 119, 6, 0.2)',
                                color: '#d97706',
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {categoryLabels[contact.category] || 'Khác'}
                              </span>
                            </td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px', color: '#0a0a0a', fontWeight: 500 }}>{contact.subject}</td>
                            <td style={{ wordWrap: 'break-word' }}>
                              {contact.image_url ? (
                                <motion.button
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setShowContactModal(true);
                                  }}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    padding: 0,
                                    cursor: 'pointer'
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <BiImage size={24} style={{ color: '#d97706' }} />
                                </motion.button>
                              ) : (
                                <span style={{ color: '#6b7280' }}>-</span>
                              )}
                            </td>
                            <td style={{ whiteSpace: 'nowrap', color: '#1a1a1a', fontWeight: 500 }}>
                              {new Date(contact.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <select
                                value={contact.status || 'pending'}
                                onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  border: `1px solid ${currentStatus?.color || '#fbbf24'}`,
                                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                  color: currentStatus?.color || '#fbbf24',
                                  fontSize: '0.875rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {statusOptions.map(opt => (
                                  <option key={opt.value} value={opt.value} style={{ backgroundColor: '#1a1a1a', color: opt.color }}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <motion.button
                                className="tet-button-outline me-2 mb-2 mb-md-0"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                                onClick={() => {
                                  setSelectedContact(contact);
                                  setShowContactModal(true);
                                  if (!contact.read) {
                                    markContactAsRead(contact.id);
                                  }
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <BiCheck className="me-1" />
                                Xem
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
                                onClick={async () => {
                                  if (window.confirm('Bạn có chắc muốn xóa liên hệ này?')) {
                                    await deleteContact(contact.id);
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
                        );
                      })
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
              <h1 className="mb-4" style={{ color: '#d97706', fontWeight: 800, wordWrap: 'break-word' }}>Trạng Thái Server</h1>
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
                    <label className="form-check-label ms-3" style={{ color: '#0a0a0a', fontWeight: 600 }}>
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
                    placeholder="Ví dụ: 1.20.4 hoặc > 1.21.4"
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
                    value={serverStatus?.version || settingsForm.server_version || ''}
                    onChange={handleSettingsChange}
                    placeholder="Tự động lấy từ trạng thái server"
                    readOnly
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)', cursor: 'not-allowed' }}
                  />
                  <small className="form-text" style={{ color: '#9ca3af' }}>
                    Phiên bản được tự động lấy từ phần Trạng Thái Server
                  </small>
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
                  <p style={{ color: '#1a1a1a', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 500 }}>
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

      {/* Contact Detail Modal */}
      {showContactModal && selectedContact && (
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
            <div className="modal-content glass-strong" style={{ border: '2px solid #d97706' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(217, 119, 6, 0.3)' }}>
                <h5 className="modal-title" style={{ color: '#d97706', fontWeight: 800 }}>
                  Chi Tiết Liên Hệ
                </h5>
                <motion.button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowContactModal(false);
                    setSelectedContact(null);
                  }}
                  whileHover={{ rotate: 90 }}
                  style={{ filter: 'invert(1)' }}
                ></motion.button>
              </div>
              <div className="modal-body" style={{ color: '#0a0a0a' }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong style={{ color: '#d97706', fontSize: '1rem' }}>Tên Game:</strong>
                    <p style={{ color: '#1a1a1a', fontWeight: 500, marginTop: '0.5rem' }}>{selectedContact.ign}</p>
                  </div>
                  <div className="col-md-6">
                    <strong style={{ color: '#d97706', fontSize: '1rem' }}>Email:</strong>
                    <p style={{ marginTop: '0.5rem' }}><a href={`mailto:${selectedContact.email}`} style={{ color: '#d97706', fontWeight: 500 }}>{selectedContact.email}</a></p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong style={{ color: '#d97706', fontSize: '1rem' }}>Số Điện Thoại:</strong>
                    <p style={{ color: '#1a1a1a', fontWeight: 500, marginTop: '0.5rem' }}>{selectedContact.phone || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <strong style={{ color: '#d97706', fontSize: '1rem' }}>Danh Mục:</strong>
                    <p style={{ marginTop: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: 'rgba(217, 119, 6, 0.2)',
                        color: '#d97706',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {categoryLabels[selectedContact.category] || 'Khác'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <strong style={{ color: '#d97706', fontSize: '1rem' }}>Chủ Đề:</strong>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, marginTop: '0.5rem' }}>{selectedContact.subject}</p>
                </div>
                <div className="mb-3">
                  <strong style={{ color: '#d97706', fontSize: '1rem' }}>Nội Dung:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', color: '#1a1a1a', fontWeight: 500, marginTop: '0.5rem' }}>{selectedContact.message}</p>
                </div>
                {selectedContact.image_url && (
                  <div className="mb-3">
                    <strong style={{ color: '#d97706', fontSize: '1rem' }}>Ảnh Đính Kèm:</strong>
                    <div className="mt-2" style={{ textAlign: 'center' }}>
                      <img 
                        src={selectedContact.image_url} 
                        alt="Contact attachment" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '500px',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '2px solid #d97706',
                          backgroundColor: '#f9fafb',
                          display: 'block',
                          margin: '0 auto'
                        }}
                        onError={(e) => {
                          console.error('Error loading image:', selectedContact.image_url);
                          e.target.alt = 'Không thể tải ảnh';
                          e.target.style.border = '2px dashed #dc2626';
                          e.target.style.padding = '2rem';
                        }}
                      />
                      <a 
                        href={selectedContact.image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'inline-block',
                          marginTop: '0.5rem',
                          color: '#d97706',
                          textDecoration: 'underline',
                          fontSize: '0.875rem'
                        }}
                      >
                        Mở ảnh trong tab mới
                      </a>
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <strong style={{ color: '#d97706', fontSize: '1rem' }}>Ngày Gửi:</strong>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, marginTop: '0.5rem' }}>{new Date(selectedContact.created_at).toLocaleString('vi-VN')}</p>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid rgba(217, 119, 6, 0.3)' }}>
                <motion.button
                  type="button"
                  className="tet-button-outline"
                  onClick={() => {
                    setShowContactModal(false);
                    setSelectedContact(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiXCircle className="me-2" />
                  Đóng
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
