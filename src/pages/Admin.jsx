import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useData } from '../context/DataContext';
import { generateContactCode, generateOrderCode } from '../utils/helpers';
import RichTextEditor from '../components/RichTextEditor';
import SummerEffect from '../components/SummerEffect';
import ShopCategoriesManagement from '../components/ShopCategoriesManagement';
import ShopProductsManagement from '../components/ShopProductsManagement';
import ShopOrdersManagement from '../components/ShopOrdersManagement';
import UserManagement from '../components/UserManagement';
import CarouselManagement from '../components/CarouselManagement';
import WalletManagement from '../components/WalletManagement';
import RechargeManagement from '../components/RechargeManagement';
import TetDatePicker from '../components/TetDatePicker';
import '../styles/summer-theme.css';
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
  BiImage,
  BiShoppingBag,
  BiUser,
  BiShow,
  BiCalendar,
  BiStar,
  BiWallet,
  BiCreditCard,
  BiRefresh,
  BiX
} from 'react-icons/bi';

const Admin = () => {
  const navigate = useNavigate();
  const {
    news,
    serverStatus,
    contacts,
    siteSettings,
    isAuthenticated,
    userProfile,
    logout,
    updateNews,
    addNews,
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
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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
  const [topDateRange, setTopDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState({
    pendingOrders: 0,
    monthlyOrders: 0,
    yearlyOrders: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalRevenue: 0,
    revenueByDay: [],
    topProducts: [],
    topDonators: [],
    recentOrders: [],
    recentContacts: [],
    pendingRecharges: 0
  });

  const loadDashboardStats = async () => {
    try {
      const [
        { data: allOrders },
        { data: recentContacts },
        { data: pendingRechargesData }
      ] = await Promise.all([
        supabase.from('orders').select('id, created_at, price, status, delivered, product, mc_username, products(name)').eq('is_deleted', false).order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
        supabase.from('recharges').select('id', { count: 'exact' }).eq('status', 'pending')
      ]);

      const pendingRechargesCount = pendingRechargesData?.length || 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const pending = allOrders.filter(o => o.status === 'paid' && !o.delivered).length;

      let mOrders = 0;
      let yOrders = 0;
      let tOrders = allOrders.length;
      let mRevenue = 0;
      let yRevenue = 0;
      let tRevenue = 0;

      const productCounts = {};
      const userSpending = {};

      const topStartDate = topDateRange.start ? new Date(topDateRange.start) : null;
      if (topStartDate) topStartDate.setHours(0, 0, 0, 0);
      
      const topEndDate = topDateRange.end ? new Date(topDateRange.end) : null;
      if (topEndDate) topEndDate.setHours(23, 59, 59, 999);

      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
          date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue: 0,
          fullDate: d.toISOString().split('T')[0]
        };
      }).reverse();

      allOrders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const isPaid = order.status === 'paid' || order.status === 'delivered' || order.delivered;
        const price = order.price || 0;

        if (isPaid) {
          tRevenue += price;
          const pName = order.product || order.products?.name || 'Ẩn danh';
          productCounts[pName] = (productCounts[pName] || 0) + 1;

          const username = order.mc_username || 'Ẩn danh';
          
          let shouldIncludeInTop = true;
          if (topStartDate && orderDate < topStartDate) {
            shouldIncludeInTop = false;
          }
          if (topEndDate && orderDate > topEndDate) {
            shouldIncludeInTop = false;
          }
          
          if (shouldIncludeInTop) {
            userSpending[username] = (userSpending[username] || 0) + price;
          }
        }

        if (orderDate.getFullYear() === currentYear) {
          yOrders++;
          if (isPaid) yRevenue += price;
          if (orderDate.getMonth() === currentMonth) {
            mOrders++;
            if (isPaid) mRevenue += price;
          }
        }

        const dateStr = orderDate.toISOString().split('T')[0];
        const dayStat = last7Days.find(d => d.fullDate === dateStr);
        if (dayStat && isPaid) {
          dayStat.revenue += price;
        }
      });

      const topProducts = Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const sortedDonators = Object.entries(userSpending)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total);

      let currentRank = 0;
      let lastTotal = -1;
      const topDonators = sortedDonators.map((user, index) => {
        if (user.total !== lastTotal) {
          currentRank = index + 1;
          lastTotal = user.total;
        }
        return { ...user, rank: currentRank };
      }).filter(u => u.rank <= 5);

      setStats({
        pendingOrders: pending,
        monthlyOrders: mOrders,
        yearlyOrders: yOrders,
        totalOrders: tOrders,
        monthlyRevenue: mRevenue,
        yearlyRevenue: yRevenue,
        totalRevenue: tRevenue,
        revenueByDay: last7Days,
        topProducts,
        topDonators,
        recentOrders: allOrders.slice(0, 5).map(o => ({
          ...o,
          customer_ign: o.mc_username,
          product_name: o.product || o.products?.name || 'Sản phẩm'
        })),
        recentContacts: recentContacts || [],
        pendingRecharges: pendingRechargesCount
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (userProfile && userProfile.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang quản trị!');
      navigate('/shop');
      return;
    }

    loadDashboardStats();
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

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardStats();
    }
  }, [topDateRange]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServerForm({ ...serverForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsForm({ ...settingsForm, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image;
    try {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('news').upload(fileName, imageFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('news').getPublicUrl(fileName);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return formData.image;
    } finally {
      setUploading(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      const success = await updateSiteSettings(settingsForm);
      if (success) alert('Đã cập nhật cài đặt thành công!');
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleAddNew = () => {
    setEditingPost(null);
    setImageFile(null);
    setFormData({ title: '', content: '', image: '', date: new Date().toISOString().split('T')[0], description: '' });
    setShowModal(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setImageFile(null);
    setFormData({ title: post.title, content: post.content, image: post.image, date: post.date, description: post.description });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const finalImageUrl = await uploadImage();
      const finalFormData = { ...formData, image: finalImageUrl };
      if (editingPost) {
        await updateNews(editingPost.id, finalFormData);
      } else {
        await addNews(finalFormData);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Xóa bài viết này?')) await deleteNews(postId);
  };

  const handleServerSave = async () => {
    try {
      const success = await updateServerStatus(serverForm);
      if (success) alert('Đã cập nhật trạng thái server thành công!');
    } catch (error) {
      console.error('Error updating server status:', error);
    }
  };

  const handleLogout = async () => { 
    await logout(); 
    navigate('/'); 
  };

  const tabs = [
    { id: 'dashboard', label: 'BẢNG ĐIỀU KHIỂN', icon: BiBarChart },
    { id: 'users', label: 'NGƯỜI DÙNG', icon: BiUser },
    { id: 'categories', label: 'DANH MỤC SHOP', icon: BiCog },
    { id: 'products', label: 'SẢN PHẨM SHOP', icon: BiShoppingBag },
    { id: 'orders', label: 'ĐƠN HÀNG SHOP', icon: BiCheckCircle },
    { id: 'recharges', label: 'DUYỆT NẠP TIỀN', icon: BiCreditCard },
    { id: 'wallets', label: 'QUẢN LÝ VÍ', icon: BiWallet },
    { id: 'news', label: 'TIN TỨC', icon: BiNews },
    { id: 'carousel', label: 'CAROUSEL', icon: BiImage },
    { id: 'contacts', label: 'LIÊN HỆ', icon: BiEnvelope },
    { id: 'server', label: 'TRẠNG THÁI SERVER', icon: BiServer },
    { id: 'settings', label: 'CÀI ĐẶT TRANG', icon: BiCog }
  ];

  return (
    <div className="admin-summer-container min-vh-100" style={{ backgroundColor: 'var(--summer-bg)' }}>
      <SummerEffect />
      
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div className="col-lg-2 shadow-sm border-end min-vh-100 d-none d-lg-block position-sticky top-0 h-100 overflow-auto pt-4" style={{ zIndex: 100, backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>
            <div className="px-4 mb-5 text-center">
              <h4 className="fw-black text-primary m-0">ADMIN PANEL</h4>
              <p className="small text-muted fw-bold mt-1">BUILDNCHILL 🏝️</p>
            </div>
            <div className="d-flex flex-column gap-1 px-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-item d-flex align-items-center gap-3 px-4 py-3 rounded-4 transition-all border-0 fw-bold text-white ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <tab.icon size={22} />
                  <span style={{ fontSize: '0.85rem' }}>{tab.label}</span>
                </button>
              ))}
              <hr className="my-3 mx-4" />
              <button
                onClick={handleLogout}
                className="d-flex align-items-center gap-3 px-4 py-3 rounded-4 transition-all border-0 text-danger fw-bold bg-transparent hover-bg-danger-subtle"
              >
                <BiLogOutCircle size={22} />
                <span style={{ fontSize: '0.85rem' }}>ĐĂNG XUẤT</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-10 p-4 p-md-5" style={{ backgroundColor: 'var(--bg-sand)', minHeight: '100vh' }}>
            {/* Header Mobile */}
            <div className="d-lg-none summer-glass p-3 mb-4 bg-white shadow-sm border-0 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h5 className="m-0 fw-black text-primary">ADMIN 🏝️</h5>
              <select 
                className="summer-input py-1 px-3 small border-primary" 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value)}
              >
                {tabs.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && (
                <div className="dashboard-content">
                  <div className="d-flex justify-content-between align-items-center mb-5">
                    <h2 className="fw-black text-primary m-0">TỔNG QUAN HỆ THỐNG</h2>
                    <button className="btn btn-light border text-primary rounded-3 shadow-sm" onClick={loadDashboardStats}>
                      <BiRefresh size={22} />
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="row g-4 mb-5">
                    {[
                      { label: 'ĐƠN HÀNG MỚI', value: stats.pendingOrders, icon: BiShoppingBag, color: 'primary' },
                      { label: 'DOANH THU THÁNG', value: `${stats.monthlyRevenue.toLocaleString()}đ`, icon: BiCreditCard, color: 'success' },
                      { label: 'NẠP TIỀN CHỜ DUYỆT', value: stats.pendingRecharges, icon: BiWallet, color: 'warning' },
                      { label: 'THÔNG TIN LIÊN HỆ', value: stats.recentContacts.length, icon: BiEnvelope, color: 'info' }
                    ].map((stat, idx) => (
                      <div key={idx} className="col-sm-6 col-xl-3">
                        <div className="summer-glass p-4 border-0 shadow-lg h-100 transition-all hover-translate-y" style={{ backgroundColor: 'var(--bg-card)' }}>
                          <div className="d-flex align-items-center gap-3">
                            <div className={`p-3 rounded-4 bg-${stat.color} bg-opacity-10 text-${stat.color}`}>
                              <stat.icon size={28} />
                            </div>
                            <div>
                              <p className="summer-label mb-0">{stat.label}</p>
                              <h3 className="fw-black text-dark m-0 mt-1">{stat.value}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="row g-4">
                    {/* Top Products */}
                    <div className="col-lg-6">
                      <div className="summer-glass p-4 border-0 shadow-lg h-100" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h5 className="fw-black text-primary mb-4">SẢN PHẨM BÁN CHẠY</h5>
                        <div className="table-responsive">
                          <table className="table summer-table mb-0">
                            <thead>
                              <tr>
                                <th>TÊN SẢN PHẨM</th>
                                <th className="text-center">SỐ LƯỢNG</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.topProducts.map((p, i) => (
                                <tr key={i}>
                                  <td className="fw-bold text-dark">{p.name}</td>
                                  <td className="text-center fw-black text-primary">{p.count}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Top Donators */}
                    <div className="col-lg-6">
                      <div className="summer-glass p-4 border-0 shadow-lg h-100" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-black text-primary m-0">TOP ĐẠI GIA 💎</h5>
                        </div>
                        <div className="table-responsive">
                          <table className="table summer-table mb-0">
                            <thead>
                              <tr>
                                <th>PLAYER</th>
                                <th className="text-end">TỔNG NẠP</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.topDonators.map((d, i) => (
                                <tr key={i}>
                                  <td>
                                    <div className="d-flex align-items-center gap-2">
                                      <span className={`badge rounded-pill bg-opacity-10 text-primary border border-primary border-opacity-20`}>{i+1}</span>
                                      <img src={`https://vzge.me/bust/${d.name}.png`} alt="Skin" style={{ width: '24px' }} />
                                      <span className="fw-bold text-dark">{d.name}</span>
                                    </div>
                                  </td>
                                  <td className="text-end fw-black text-success">{d.total.toLocaleString()}đ</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="col-12">
                      <div className="summer-glass p-4 border-0 shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h5 className="fw-black text-primary mb-4">ĐƠN HÀNG GẦN ĐÂY</h5>
                        <div className="table-responsive">
                          <table className="table summer-table mb-0">
                            <thead>
                              <tr>
                                <th>MÃ ĐƠN</th>
                                <th>NGƯỜI CHƠI</th>
                                <th>SẢN PHẨM</th>
                                <th>GIÁ</th>
                                <th>TRẠNG THÁI</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.recentOrders.map(o => (
                                <tr key={o.id}>
                                  <td className="fw-black text-primary small">#{generateOrderCode(o.id)}</td>
                                  <td className="fw-bold text-dark">{o.mc_username}</td>
                                  <td className="fw-medium">{o.product_name}</td>
                                  <td className="fw-bold text-success">{o.price?.toLocaleString()}đ</td>
                                  <td>
                                    <span className={`badge rounded-pill px-3 py-1 ${o.delivered ? 'bg-success' : o.status === 'paid' ? 'bg-info' : 'bg-warning text-dark'}`}>
                                      {o.delivered ? 'ĐÃ GIAO' : o.status === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHỜ NẠP'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'categories' && <ShopCategoriesManagement />}
              {activeTab === 'products' && <ShopProductsManagement />}
              {activeTab === 'orders' && <ShopOrdersManagement />}
              {activeTab === 'recharges' && <RechargeManagement />}
              {activeTab === 'wallets' && <WalletManagement />}
              {activeTab === 'carousel' && <CarouselManagement />}

              {activeTab === 'news' && (
                <div className="news-management">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
                    <h3 className="fw-black text-primary m-0">QUẢN LÝ TIN TỨC</h3>
                    <button className="summer-button py-2 px-4 shadow-sm" onClick={handleAddNew}>
                      <BiPlus size={20} className="me-1" /> VIẾT BÀI MỚI
                    </button>
                  </div>

                  <div className="row g-4">
                    {news.map(post => (
                      <div key={post.id} className="col-md-6 col-xl-4">
                        <div className="summer-glass p-0 overflow-hidden h-100 shadow-lg border-0 bg-white d-flex flex-column">
                          <img src={post.image} className="w-100 object-fit-cover" style={{ height: '160px' }} alt={post.title} />
                          <div className="p-4 flex-grow-1">
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 mb-2">{post.date}</span>
                            <h5 className="fw-black text-dark text-truncate-2 mb-2" style={{ height: '48px' }}>{post.title}</h5>
                            <p className="small text-muted text-truncate-3 mb-4">{post.description}</p>
                            <div className="d-flex gap-2 mt-auto">
                              <button className="btn btn-sm btn-outline-info rounded-pill px-3 fw-bold flex-grow-1" onClick={() => handleEdit(post)}>SỬA</button>
                              <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold flex-grow-1" onClick={() => handleDelete(post.id)}>XÓA</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="contacts-management">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
                    <h3 className="fw-black text-primary m-0">THÔNG TIN LIÊN HỆ</h3>
                  </div>
                  <div className="summer-glass overflow-hidden border-0 bg-white shadow-lg">
                    <div className="table-responsive">
                      <table className="table summer-table mb-0">
                        <thead>
                          <tr>
                            <th className="ps-4">MÃ</th>
                            <th>NGƯỜI GỬI</th>
                            <th>TIÊU ĐỀ</th>
                            <th>NGÀY GỬI</th>
                            <th className="text-center">TRẠNG THÁI</th>
                            <th className="text-end pe-4">THAO TÁC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contacts.map(contact => (
                            <tr key={contact.id}>
                              <td className="ps-4 align-middle fw-black text-primary small">#{generateContactCode(contact.id)}</td>
                              <td className="align-middle fw-bold text-dark">{contact.ign || contact.name}</td>
                              <td className="align-middle text-truncate fw-medium" style={{ maxWidth: '200px' }}>{contact.subject}</td>
                              <td className="align-middle small text-muted">{new Date(contact.created_at).toLocaleDateString('vi-VN')}</td>
                              <td className="align-middle text-center">
                                <span className={`badge rounded-pill px-3 py-1 ${
                                  contact.status === 'resolved' ? 'bg-success' : 'bg-warning text-dark'
                                }`}>
                                  {contact.status === 'resolved' ? 'ĐÃ XỬ LÝ' : 'CHỜ PHẢN HỒI'}
                                </span>
                              </td>
                              <td className="align-middle text-end pe-4">
                                <div className="d-flex justify-content-end gap-2">
                                  <button className="btn btn-sm btn-info text-white rounded-circle p-2" onClick={() => {
                                    setSelectedContact(contact);
                                    setShowContactModal(true);
                                    if (!contact.read) markContactAsRead(contact.id);
                                  }}><BiShow size={18} /></button>
                                  <button className="btn btn-sm btn-danger rounded-circle p-2" onClick={() => deleteContact(contact.id)}><BiTrash size={18} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'server' && (
                <div className="server-status-management">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
                    <h3 className="fw-black text-primary m-0">TRẠNG THÁI MÁY CHỦ</h3>
                    <button className="summer-button py-2 px-4 shadow-sm" onClick={handleServerSave}>
                      <BiCheck size={20} className="me-1" /> LƯU THAY ĐỔI
                    </button>
                  </div>
                  <div className="summer-glass p-4 bg-white shadow-lg border-0">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="summer-label">TRẠNG THÁI HIỂN THỊ</label>
                        <select className="summer-input w-100 py-2" name="status" value={serverForm.status} onChange={handleServerChange}>
                          <option value="Online">Hoạt động (Online)</option>
                          <option value="Offline">Bảo trì (Offline)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="summer-label">PHIÊN BẢN HỖ TRỢ</label>
                        <input className="summer-input w-100 py-2" name="version" value={serverForm.version} onChange={handleServerChange} placeholder="VD: 1.20.4" />
                      </div>
                      <div className="col-md-6">
                        <label className="summer-label">SỐ NGƯỜI CHƠI HIỆN TẠI</label>
                        <input className="summer-input w-100 py-2" name="players" value={serverForm.players} onChange={handleServerChange} placeholder="VD: 15" />
                      </div>
                      <div className="col-md-6">
                        <label className="summer-label">GIỚI HẠN NGƯỜI CHƠI (MAX)</label>
                        <input className="summer-input w-100 py-2" name="maxPlayers" value={serverForm.maxPlayers} onChange={handleServerChange} placeholder="VD: 500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="site-settings-management">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
                    <h3 className="fw-black text-primary m-0">CÀI ĐẶT WEBSITE</h3>
                    <button className="summer-button py-2 px-4 shadow-sm" onClick={handleSettingsSave}>
                      <BiCheck size={20} className="me-1" /> LƯU CẤU HÌNH
                    </button>
                  </div>
                  <div className="summer-glass p-4 bg-white shadow-lg border-0">
                    <div className="row g-4">
                      <div className="col-md-12">
                        <label className="summer-label">TIÊU ĐỀ TRANG WEB</label>
                        <input className="summer-input w-100 py-2" name="site_title" value={settingsForm.site_title} onChange={handleSettingsChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="summer-label">ĐỊA CHỈ IP SERVER MC</label>
                        <input className="summer-input w-100 py-2" name="server_ip" value={settingsForm.server_ip} onChange={handleSettingsChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="summer-label">PHIÊN BẢN</label>
                        <input className="summer-input w-100 py-2" name="server_version" value={settingsForm.server_version} onChange={handleSettingsChange} placeholder="VD: 50.000 VNĐ" />
                      </div>
                      <div className="col-md-6">
                        <label className="summer-label">EMAIL LIÊN HỆ</label>
                        <input className="summer-input w-100 py-2" name="contact_email" value={settingsForm.contact_email} onChange={handleSettingsChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="summer-label">SỐ ĐIỆN THOẠI</label>
                        <input className="summer-input w-100 py-2" name="contact_phone" value={settingsForm.contact_phone} onChange={handleSettingsChange} />
                      </div>
                      <div className="col-md-12">
                        <label className="summer-label">LINK DISCORD SERVER</label>
                        <input className="summer-input w-100 py-2" name="discord_url" value={settingsForm.discord_url} onChange={handleSettingsChange} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals Tin Tức */}
      <AnimatePresence>
        {showModal && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 10000, backdropFilter: 'blur(8px)' }} onClick={() => setShowModal(false)}>
            <motion.div 
              className="summer-glass p-0 border-0 bg-white overflow-hidden shadow-2xl" 
              style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 className="m-0 fw-black">{editingPost ? 'SỬA BÀI VIẾT' : 'THÊM TIN TỨC MỚI'}</h4>
                <button className="btn btn-link text-white p-0" onClick={() => setShowModal(false)}><BiX size={28} /></button>
              </div>
              <div className="p-4 overflow-auto">
                <div className="mb-4">
                  <label className="summer-label">TIÊU ĐỀ BÀI VIẾT</label>
                  <input className="summer-input w-100" name="title" value={formData.title} onChange={handleInputChange} />
                </div>
                <div className="mb-4">
                  <label className="summer-label">MÔ TẢ NGẮN</label>
                  <textarea className="summer-input w-100" rows="2" name="description" value={formData.description} onChange={handleInputChange} />
                </div>
                <div className="mb-4">
                  <label className="summer-label">HÌNH ẢNH MINH HỌA</label>
                  <div className="d-flex gap-3 align-items-center">
                    <div className="rounded-4 overflow-hidden bg-light" style={{ width: '120px', height: '80px' }}>
                      <img src={imageFile ? URL.createObjectURL(imageFile) : (formData.image || 'https://via.placeholder.com/120x80')} className="w-100 h-100 object-fit-cover" />
                    </div>
                    <div className="flex-grow-1">
                      <input type="file" className="form-control form-control-sm mb-2" onChange={handleImageChange} accept="image/*" />
                      <input className="summer-input py-1 px-3 small w-100" name="image" value={formData.image} onChange={handleInputChange} placeholder="Hoặc dán URL ảnh..." />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="summer-label">NỘI DUNG CHI TIẾT</label>
                  <div className="summer-glass border p-1">
                    <RichTextEditor value={formData.content} onChange={(val) => setFormData({ ...formData, content: val })} />
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button className="summer-button flex-grow-1 py-3" onClick={handleSave} disabled={uploading}>
                    {uploading ? 'ĐANG TẢI ẢNH...' : 'LƯU BÀI VIẾT'}
                  </button>
                  <button className="summer-button-outline px-4 py-3" onClick={() => setShowModal(false)}>HỦY</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showContactModal && selectedContact && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 10000, backdropFilter: 'blur(8px)' }} onClick={() => setShowContactModal(false)}>
            <motion.div 
              className="summer-glass p-0 border-0 bg-white overflow-hidden shadow-2xl" 
              style={{ maxWidth: '600px', width: '100%' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 className="m-0 fw-black">THÔNG TIN LIÊN HỆ</h4>
                <button className="btn btn-link text-white p-0" onClick={() => setShowContactModal(false)}><BiX size={28} /></button>
              </div>
              <div className="p-4">
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <p className="summer-label mb-1">NGƯỜI GỬI</p>
                    <p className="fw-bold text-dark m-0">{selectedContact.ign || selectedContact.name}</p>
                    <p className="small text-muted m-0">{selectedContact.email}</p>
                  </div>
                  <div className="col-6 text-end">
                    <p className="summer-label mb-1">THỜI GIAN</p>
                    <p className="small fw-bold text-muted">{new Date(selectedContact.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="col-12">
                    <p className="summer-label mb-1">TIÊU ĐỀ</p>
                    <div className="p-3 bg-light rounded-3 fw-bold border-start border-4 border-primary">
                      {selectedContact.subject}
                    </div>
                  </div>
                  <div className="col-12">
                    <p className="summer-label mb-1">NỘI DUNG TIN NHẮN</p>
                    <div className="p-3 bg-light rounded-4 text-dark shadow-sm">
                      {selectedContact.message}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button className="summer-button flex-grow-1 py-3" onClick={() => {
                    updateContactStatus(selectedContact.id, 'resolved');
                    setShowContactModal(false);
                  }}>
                    <BiCheckCircle size={20} className="me-1" /> ĐÁNH DẤU ĐÃ GIẢI QUYẾT
                  </button>
                  <button className="summer-button-outline px-4 py-3" onClick={() => setShowContactModal(false)}>ĐÓNG</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;