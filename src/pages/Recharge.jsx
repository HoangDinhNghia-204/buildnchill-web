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
    bank_account: '0000865746243',
    bank_name: 'MBBank',
    account_name: 'LE DUC TRONG'
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

        if (uploadError) throw new Error('Lỗi khi tải ảnh lên: ' + uploadError.message);

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
        const RECHARGE_WEBHOOK_URL = 'https://discord.com/api/webhooks/1467696152559227063/ms7Z7n4a6btul6Wlie0ugrjIN7HZTtdCVOrJFddUXjiFwdi0-TNjfJ_u6f9yFwyqD4ir';
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
          <div className="col-lg-5">
            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="summer-glass p-4 h-100 shadow-2xl border-0">
              <h4 className="summer-label mb-4 d-flex align-items-center gap-2">
                <BiInfoCircle /> HƯỚNG DẪN NẠP
              </h4>
              
              <div className="p-4 bg-white rounded-4 border-2 border-info border-dashed mb-4 text-center">
                <img 
                  src={`https://vzge.me/bust/${userProfile?.username}.png`} 
                  alt="avatar" 
                  className="rounded-4 shadow-lg mb-3 border border-3 border-info"
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                />
                <div className="fw-black h4 text-primary m-0">{userProfile?.username?.toUpperCase()}</div>
                <div className="badge bg-info bg-opacity-10 text-info mt-2 px-3">TÀI KHOẢN NGƯỜI CHƠI</div>
              </div>

              <div className="p-3 bg-info bg-opacity-10 rounded-4 border border-info border-opacity-20 mb-4">
                <div className="small fw-black text-primary mb-2">THÔNG TIN CHUYỂN KHOẢN</div>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between border-bottom border-info border-opacity-10 pb-1">
                    <span className="small text-muted">Ngân hàng:</span>
                    <span className="fw-bold text-dark">{paymentInfo.bank_name}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom border-info border-opacity-10 pb-1">
                    <span className="small text-muted">Số tài khoản:</span>
                    <span className="fw-black text-info">{paymentInfo.bank_account}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="small text-muted">Chủ TK:</span>
                    <span className="fw-bold text-dark">{paymentInfo.account_name}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-3 border-2 border-primary text-center shadow-sm">
                  <div className="x-small text-muted fw-bold mb-1">NỘI DUNG CHUYỂN KHOẢN:</div>
                  <div className="h4 fw-black text-primary m-0 user-select-all">NAP {userProfile?.username}</div>
                </div>
              </div>

              <div className="text-center">
                <h6 className="summer-label mb-3 d-flex align-items-center justify-content-center gap-2">
                  <BiQrScan /> QUÉT MÃ VIETQR
                </h6>
                <AnimatePresence mode='wait'>
                  {rechargeForm.amount && parseInt(rechargeForm.amount) >= 1000 ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                      <img
                        src={`https://img.vietqr.io/image/MB-${paymentInfo.bank_account}-compact2.png?amount=${rechargeForm.amount}&addInfo=NAP ${userProfile?.username}&accountName=${paymentInfo.account_name}`}
                        alt="VietQR"
                        className="img-fluid rounded-4 shadow-xl border border-4 border-white"
                        style={{ maxWidth: '280px' }}
                      />
                      <div className="mt-3 small fw-bold text-primary">Mã QR đã bao gồm số tiền và nội dung ✅</div>
                    </motion.div>
                  ) : (
                    <div className="p-5 bg-light rounded-4 border-2 border-dashed text-muted opacity-50">
                      <BiQrScan size={80} className="mb-3 d-block mx-auto" />
                      Nhập số tiền để tạo mã QR nạp nhanh
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Form Column */}
          <div className="col-lg-6">
            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="summer-glass p-4 p-md-5 h-100 shadow-2xl border-0">
              <h4 className="summer-label mb-5 d-flex align-items-center gap-2">
                <BiPlusCircle /> TẠO YÊU CẦU NẠP TIỀN
              </h4>
              
              <form onSubmit={handleRechargeSubmit} className="row g-4">
                <div className="col-12">
                  <label className="summer-label">SỐ TIỀN CẦN NẠP (VNĐ)</label>
                  <input 
                    type="number" 
                    className="summer-input w-100 py-3 px-4" 
                    placeholder="Ví dụ: 50000" 
                    value={rechargeForm.amount} 
                    onChange={e => setRechargeForm({...rechargeForm, amount: e.target.value})} 
                    required 
                  />
                  <div className="small text-info mt-2 fw-bold">Tối thiểu: 1,000đ - Tối đa: 50,000,000đ</div>
                </div>

                <div className="col-12">
                  <label className="summer-label">PHƯƠNG THỨC</label>
                  <div className="p-3 bg-white rounded-4 border border-info border-opacity-20 d-flex align-items-center gap-3 shadow-sm">
                    <div className="p-2 bg-info bg-opacity-10 rounded-3">
                      <BiCreditCard size={28} className="text-info" />
                    </div>
                    <div>
                      <div className="fw-black text-primary">CHUYỂN KHOẢN NGÂN HÀNG</div>
                      <div className="small text-muted">VietQR - Tự động duyệt qua SePay</div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <label className="summer-label">ẢNH MINH CHỨNG (TÙY CHỌN)</label>
                  <div 
                    className="summer-glass p-5 text-center border-dashed border-2 cursor-pointer transition-all bg-white bg-opacity-50"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    {rechargeForm.proof_image ? (
                      <div className="text-success fw-bold">
                        <BiCheckCircle size={50} className="mb-2" />
                        <div className="text-truncate px-3">{rechargeForm.proof_image.name}</div>
                      </div>
                    ) : (
                      <>
                        <BiUpload size={50} className="text-info opacity-50 mb-3" />
                        <div className="fw-bold text-primary">Tải ảnh biên lai lên</div>
                        <div className="small text-muted">Giúp Admin đối soát nhanh hơn khi cần thiết</div>
                      </>
                    )}
                    <input type="file" id="file-upload" className="d-none" onChange={handleFileChange} accept="image/*" />
                  </div>
                </div>

                <div className="col-12 mt-5">
                  <button type="submit" disabled={uploading} className="summer-button w-100 py-4 shadow-xl">
                    {uploading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐÃ CHUYỂN KHOẢN 🚀'}
                  </button>
                  <p className="text-center mt-3 small text-muted fw-bold">
                    <BiInfoCircle className="me-1" />
                    Hệ thống sẽ tự động cộng tiền sau 30s - 3p
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="summer-glass p-5 text-center shadow-2xl" style={{ maxWidth: '450px' }}>
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
