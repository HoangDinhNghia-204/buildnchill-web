import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { BiPlusCircle, BiUpload, BiCheckCircle, BiInfoCircle, BiQrScan, BiCreditCard, BiWallet } from 'react-icons/bi';
import SummerEffect from '../components/SummerEffect';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import '../styles/summer-theme.css';

const Recharge = () => {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, loading } = useData();
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rechargeForm, setRechargeForm] = useState({
    amount: '',
    payment_method: 'bank',
    proof_image: null
  });

  const paymentInfo = {
    bank_account: import.meta.env.VITE_BANK_ACCOUNT,
    bank_name: import.meta.env.VITE_BANK_NAME,
    account_name: import.meta.env.VITE_BANK_ACCOUNT_NAME
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setRechargeForm({ ...rechargeForm, proof_image: e.target.files[0] });
    }
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !userProfile) {
      alert('Vui lòng đăng nhập để nạp tiền!');
      navigate('/login');
      return;
    }

    if (!rechargeForm.amount) {
      alert('Vui lòng nhập số tiền!');
      return;
    }

    setUploading(true);
    try {
      let publicUrl = null;
      if (rechargeForm.proof_image) {
        const fileExt = rechargeForm.proof_image.name.split('.').pop();
        const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('recharges')
          .upload(fileName, rechargeForm.proof_image);

        if (uploadError) {
          console.error('Supabase Storage Error:', uploadError);
          throw new Error('Lỗi khi tải ảnh lên: ' + (uploadError.message || 'Không xác định'));
        }

        const { data: urlData } = supabase.storage
          .from('recharges')
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      const { data: rechargeData, error: insertError } = await supabase
        .from('recharges')
        .insert({
          user_id: userProfile.id,
          amount: parseInt(rechargeForm.amount),
          payment_method: rechargeForm.payment_method,
          proof_image: publicUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw new Error('Lỗi khi lưu yêu cầu: ' + insertError.message);

      // Discord notification on submit
      try {
        const RECHARGE_WEBHOOK_URL = import.meta.env.VITE_DISCORD_BANK_WEBHOOK;
        const embed = {
          title: '💰 YÊU CẦU NẠP TIỀN MỚI',
          description: `👤 Người chơi **${userProfile.username}** vừa gửi một yêu cầu nạp tiền!`,
          color: 0x0ea5e9,
          fields: [
            { name: '👤 Người chơi', value: userProfile.username, inline: true },
            { name: '💰 Số tiền', value: `${Number(rechargeForm.amount).toLocaleString('vi-VN')} VNĐ`, inline: true },
            { name: '💳 Phương thức', value: 'Chuyển khoản (VietQR)', inline: true },
            { name: '🆔 Mã yêu cầu', value: `\`${rechargeData.id}\`` }
          ],
          image: publicUrl ? { url: publicUrl } : null,
          footer: { text: 'BuildnChill System - Summer Recharge' },
          timestamp: new Date().toISOString()
        };

        await fetch(RECHARGE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: '🔔 **YÊU CẦU NẠP TIỀN MỚI**',
            embeds: [embed]
          })
        });
      } catch (discordError) {
        console.error('Discord notification error:', discordError);
      }

      setShowSuccess(true);
      setRechargeForm({ amount: '', payment_method: 'bank', proof_image: null });
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center py-5 mt-5"><div className="spinner-border text-info"></div></div>;

  return (
    <div className="shop-summer-container min-vh-100">
      <SummerEffect />

      {/* Summer Background Items */}
      <div className="summer-item" style={{ top: '10%', left: '5%', fontSize: '50px' }}>🌴</div>
      <div className="summer-item" style={{ bottom: '15%', right: '5%', fontSize: '40px' }}>🍹</div>
      <div className="summer-item dolphin" style={{ top: '40%', right: '-30px' }}>🐬</div>

      <div className="container py-5 position-relative" style={{ zIndex: 10 }}>
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-5">
          <h1 className="summer-title display-4 fw-black">NẠP TIỀN VÀO VÍ 🌊</h1>
          <p className="lead fw-bold text-primary">Hệ thống cộng tiền tự động SePay 24/7 ✅</p>
        </motion.div>

        <div className="row g-4 justify-content-center">
          {/* Instructions Column */}
          <div className="col-lg-6">
            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="summer-glass p-4 p-md-5 h-100 shadow-2xl border-0" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h4 className="summer-label mb-4 d-flex align-items-center gap-2">
                <BiQrScan /> QUÉT MÃ VIETQR ĐỂ NẠP TỰ ĐỘNG
              </h4>

              <div className="p-4 rounded-4 border-2 border-info border-dashed mb-4 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
                <img
                  src={`https://vzge.me/bust/${userProfile?.username}.png`}
                  alt="avatar"
                  className="rounded-4 shadow-lg mb-3 border border-3 border-info"
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                />
                <div className="fw-black h4 text-primary m-0">{userProfile?.username?.toUpperCase()}</div>
                <div className="badge bg-info bg-opacity-10 text-info mt-2 px-3">TÀI KHOẢN THỤ HƯỞNG</div>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-md-12">
                  <label className="summer-label text-center">NHẬP SỐ TIỀN MUỐN NẠP (VNĐ)</label>
                  <input
                    type="number"
                    className="summer-input w-100 py-3 px-4 text-center fs-4 fw-black text-primary"
                    placeholder="Ví dụ: 50000"
                    value={rechargeForm.amount}
                    onChange={e => setRechargeForm({ ...rechargeForm, amount: e.target.value })}
                  />
                  <div className="text-center small text-info mt-2 fw-bold">Tối thiểu: 1,000đ - Tự động cộng sau 30s - 1p</div>
                </div>
              </div>

              <div className="text-center py-2">
                <AnimatePresence mode='wait'>
                  {rechargeForm.amount && parseInt(rechargeForm.amount) >= 1000 ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                      <div className="position-relative d-inline-block p-3 rounded-4 shadow-xl border border-4 border-info border-opacity-20 mb-3" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <img
                          src={`https://img.vietqr.io/image/MB-${paymentInfo.bank_account}-compact2.png?amount=${rechargeForm.amount}&addInfo=NAP ${userProfile?.username}&accountName=${paymentInfo.account_name}`}
                          alt="VietQR"
                          className="img-fluid"
                          style={{ maxWidth: '280px' }}
                        />
                        <div className="position-absolute top-50 start-50 translate-middle opacity-10" style={{ zIndex: -1 }}>
                          <BiQrScan size={150} />
                        </div>
                      </div>
                      <div className="p-3 bg-primary bg-opacity-10 rounded-4 border-2 border-primary border-dashed mb-4">
                        <div className="x-small text-muted fw-bold mb-1">NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC):</div>
                        <div className="h4 fw-black text-primary m-0 user-select-all">NAP {userProfile?.username}</div>
                      </div>
                      <div className="alert bg-success bg-opacity-10 border-success border-opacity-20 text-success fw-bold rounded-4 py-3">
                        <BiCheckCircle className="me-2" size={22} />
                        Hệ thống SePay sẽ tự động cộng tiền khi bạn chuyển khoản xong!
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-5 rounded-4 border-2 border-dashed text-muted opacity-50" style={{ backgroundColor: 'var(--bg-sand-light)' }}>
                      <BiQrScan size={80} className="mb-3 d-block mx-auto" />
                      Vui lòng nhập số tiền để tạo mã QR nạp tự động
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Guide Column */}
          <div className="col-lg-5">
            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="summer-glass p-4 p-md-5 h-100 shadow-2xl border-0" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h4 className="summer-label mb-4 d-flex align-items-center gap-2">
                <BiInfoCircle /> LƯU Ý KHI NẠP
              </h4>

              <div className="d-flex flex-column gap-4">
                <div className="d-flex gap-3 align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10 text-info" style={{ width: '48px', height: '48px', flexShrink: 0 }}><BiCheckCircle size={24} /></div>
                  <div>
                    <h6 className="fw-black text-dark mb-1">Duyệt tự động 24/7</h6>
                    <p className="small text-muted m-0">Tiền sẽ được cộng vào ví của bạn sau 30 giây đến 1 phút kể từ khi giao dịch thành công.</p>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 text-warning" style={{ width: '48px', height: '48px', flexShrink: 0 }}><BiInfoCircle size={24} /></div>
                  <div>
                    <h6 className="fw-black text-dark mb-1">Đúng nội dung chuyển khoản</h6>
                    <p className="small text-muted m-0">Hãy đảm bảo nội dung chuyển khoản là <span className="fw-bold text-primary">NAP {userProfile?.username}</span> để hệ thống nhận diện được bạn.</p>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10 text-info" style={{ width: '48px', height: '48px', flexShrink: 0 }}><BiWallet size={24} /></div>
                  <div>
                    <h6 className="fw-black text-dark mb-1">Hỗ trợ nạp lỗi</h6>
                    <p className="small text-muted m-0">Nếu sau 5 phút vẫn chưa thấy tiền, vui lòng liên hệ Admin qua Discord hoặc mục Liên hệ kèm ảnh biên lai.</p>
                  </div>
                </div>

                <hr className="my-2 border-info border-opacity-20" />

                <div className="p-4 rounded-4" style={{ backgroundColor: 'var(--bg-sand-light)' }}>
                  <div className="small fw-bold text-muted mb-3 text-uppercase tracking-widest">Thông tin ngân hàng</div>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Ngân hàng:</span>
                      <span className="fw-black text-dark">MB Bank</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Số tài khoản:</span>
                      <span className="fw-black text-primary">0000865746243</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Chủ tài khoản:</span>
                      <span className="fw-black text-dark">LE DUC TRONG</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate('/profile')} className="summer-button w-100 py-3 mt-auto">
                  XEM LỊCH SỬ BIẾN ĐỘNG VÍ →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="summer-glass p-5 text-center shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', maxWidth: '450px' }}>
              <div className="bg-success bg-opacity-10 p-4 rounded-circle d-inline-block mb-4 shadow-sm">
                <BiCheckCircle size={80} className="text-success" />
              </div>
              <h2 className="summer-title mb-3">ĐÃ GỬI YÊU CẦU!</h2>
              <p className="fw-bold text-primary mb-4">
                Cảm ơn bạn đã nạp tiền. Vui lòng chờ 1-3 phút để hệ thống SePay tự động kiểm tra và cộng số dư vào ví của bạn.
              </p>
              <div className="d-grid gap-2">
                <button onClick={() => navigate('/shop')} className="summer-button py-3">VỀ CỬA HÀNG 🛒</button>
                <button onClick={() => setShowSuccess(false)} className="btn btn-link text-muted fw-bold text-decoration-none">ĐÓNG THÔNG BÁO</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Recharge;
