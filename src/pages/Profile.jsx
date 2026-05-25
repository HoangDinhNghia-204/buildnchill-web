import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { BiWallet, BiHistory, BiUser, BiPlusCircle, BiLogOut, BiX, BiUpload, BiCheckCircle, BiQrScan, BiCreditCard, BiLockAlt, BiShieldQuarter } from 'react-icons/bi';
import SummerEffect from '../components/SummerEffect';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import '../styles/summer-theme.css';

const Profile = () => {
  const navigate = useNavigate();
  const { updatePassword, isAuthenticated, loading: authLoading } = useData();
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [rechargeHistory, setRechargeHistory] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else {
      fetchUserData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [prof, wal] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('wallets').select('*').eq('user_id', user.id).single()
      ]);

      setProfile(prof.data);
      setWallet(wal.data);

      if (wal.data) {
        const [trans, recharges] = await Promise.all([
          supabase.from('wallet_transactions')
            .select('*')
            .eq('wallet_id', wal.data.id)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase.from('recharges')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
        ]);
        setTransactions(trans.data || []);
        setRechargeHistory(recharges.data || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setUpdatingPassword(true);
    try {
      const success = await updatePassword(passwordForm.newPassword);
      if (success) {
        alert('Cập nhật mật khẩu thành công!');
        setShowPasswordModal(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        alert('Cập nhật mật khẩu thất bại.');
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading || authLoading) return <div className="text-center py-5 mt-5"><div className="spinner-border text-info"></div></div>;

  return (
    <div className="shop-summer-container min-vh-100">
      <SummerEffect />

      {/* Summer Background Items */}
      <div className="summer-item" style={{ top: '15%', right: '10%', fontSize: '45px' }}>🐚</div>
      <div className="summer-item dolphin" style={{ top: '25%', left: '-40px', animationDelay: '1s' }}>🐬</div>
      <div className="summer-item" style={{ bottom: '10%', left: '5%', fontSize: '50px' }}>⛵</div>

      <div className="container py-5 position-relative" style={{ zIndex: 10 }}>
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-5 text-center">
          <h1 className="summer-title display-4 fw-black">HỒ SƠ CỦA BẠN 🌊</h1>
        </motion.div>

        <div className="row g-4">
          {/* User Info Card */}
          <div className="col-lg-4">
            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="summer-glass p-4 text-center sticky-top shadow-2xl border-0" style={{ top: '100px', backgroundColor: 'var(--bg-card)' }}>
              <div className="mb-4 position-relative d-inline-block">
                <div className="rounded-circle p-2 shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <img
                    src={`https://vzge.me/bust/${profile?.username}.png`}
                    alt="avatar"
                    className="rounded-circle shadow-inner border border-4 border-info"
                    style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                  />
                </div>
                <div className="position-absolute bottom-0 end-0 bg-success border border-white border-3 rounded-circle" style={{ width: '25px', height: '25px', boxShadow: '0 0 15px rgba(25, 135, 84, 0.5)' }}></div>
              </div>

              <h3 className="fw-black text-primary mb-1">{profile?.username?.toUpperCase()}</h3>
              <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
                {profile?.role === 'admin' ? (
                  <span className="badge bg-danger px-3 py-2 rounded-pill d-flex align-items-center gap-1 shadow-sm">
                    <BiShieldQuarter /> QUẢN TRỊ VIÊN
                  </span>
                ) : (
                  <span className="badge bg-info px-3 py-2 rounded-pill d-flex align-items-center gap-1 shadow-sm text-white">
                    <BiUser /> NGƯỜI CHƠI
                  </span>
                )}
              </div>

              <div className="p-4 rounded-4 shadow-inner mb-4 border border-info border-opacity-20" style={{ backgroundColor: 'var(--bg-sand-light)' }}>
                <div className="small text-muted mb-1 fw-bold text-uppercase tracking-wider">Số dư ví hiện tại</div>
                <h2 className="text-info fw-black mb-0 display-6">{(wallet?.balance || 0).toLocaleString()} <small className="h5">VNĐ</small></h2>
              </div>

              <div className="d-grid gap-3">
                <button onClick={() => navigate('/recharge')} className="summer-button py-3 shadow-lg"><BiPlusCircle className="me-2" /> NẠP TIỀN VÀO VÍ</button>
                <button onClick={() => setShowPasswordModal(true)} className="summer-button py-2"><BiLockAlt className="me-2" /> ĐỔI MẬT KHẨU</button>
                <button onClick={handleLogout} className="btn btn-link text-muted fw-bold text-decoration-none py-2 hover-text-danger"><BiLogOut className="me-1" /> Đăng xuất</button>
              </div>
            </motion.div>
          </div>

          {/* Activity Column */}
          <div className="col-lg-8">
            <div className="d-flex flex-column gap-4">
              {/* Wallet History */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="summer-glass p-4 p-md-5 shadow-2xl border-0 overflow-hidden position-relative" style={{ backgroundColor: 'var(--bg-card)' }}>
                <h4 className="summer-label mb-4 d-flex align-items-center">
                  <BiHistory size={28} className="me-2" /> LỊCH SỬ BIẾN ĐỘNG VÍ
                </h4>
                <div className="table-responsive">
                  <table className="table table-hover align-middle custom-summer-table">
                    <thead>
                      <tr>
                        <th>THỜI GIAN</th>
                        <th>LOẠI</th>
                        <th className="text-end">SỐ TIỀN</th>
                        <th className="text-end">GHI CHÚ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td className="small fw-bold text-muted">{new Date(t.created_at).toLocaleString('vi-VN')}</td>
                          <td>
                            <span className={`badge rounded-pill px-3 ${t.amount > 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                              {t.type === 'recharge' ? 'Nạp tiền' : t.type === 'purchase' ? 'Mua hàng' : 'Khác'}
                            </span>
                          </td>
                          <td className={`fw-black text-end ${t.amount > 0 ? 'text-success' : 'text-danger'}`}>
                            {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}đ
                          </td>
                          <td className="small text-end fw-bold text-primary">{t.note}</td>
                        </tr>
                      ))}
                      {transactions.length === 0 && <tr><td colSpan="4" className="text-center py-5 text-muted fw-bold">Chưa có giao dịch nào 🏜️</td></tr>}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Recharge Status */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="summer-glass p-4 p-md-5 shadow-2xl border-0">
                <h4 className="summer-label mb-4 d-flex align-items-center">
                  <BiCheckCircle size={28} className="me-2" /> TRẠNG THÁI NẠP TIỀN
                </h4>
                <div className="table-responsive">
                  <table className="table table-hover align-middle custom-summer-table">
                    <thead>
                      <tr>
                        <th>NGÀY GỬI</th>
                        <th className="text-end">SỐ TIỀN</th>
                        <th className="text-end">TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rechargeHistory.map((r) => (
                        <tr key={r.id}>
                          <td className="small fw-bold text-muted">{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                          <td className="fw-black text-end text-primary">{r.amount.toLocaleString()}đ</td>
                          <td className="text-end">
                            <span className={`badge rounded-pill px-3 py-2 ${r.status === 'pending' ? 'bg-warning text-dark' :
                                r.status === 'approved' ? 'bg-success text-white' : 'bg-danger text-white'
                              } shadow-sm`}>
                              {r.status === 'pending' ? '⏳ Đang chờ' : r.status === 'approved' ? '✅ Thành công' : '❌ Đã hủy'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {rechargeHistory.length === 0 && <tr><td colSpan="3" className="text-center py-5 text-muted fw-bold">Không có yêu cầu nạp tiền 🏖️</td></tr>}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="summer-glass p-4 p-md-5 w-100 shadow-2xl border-0" style={{ maxWidth: '450px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="summer-label m-0">ĐỔI MẬT KHẨU 🔑</h4>
                <button onClick={() => setShowPasswordModal(false)} className="btn btn-link text-primary p-0"><BiX size={35} /></button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="d-flex flex-column gap-4">
                <div>
                  <label className="summer-label">MẬT KHẨU MỚI</label>
                  <input
                    type="password"
                    className="summer-input w-100"
                    placeholder="Ít nhất 6 ký tự..."
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="summer-label">XÁC NHẬN MẬT KHẨU</label>
                  <input
                    type="password"
                    className="summer-input w-100"
                    placeholder="Nhập lại mật khẩu..."
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" disabled={updatingPassword} className="summer-button py-3 mt-2">
                  {updatingPassword ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT MẬT KHẨU 💾'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
