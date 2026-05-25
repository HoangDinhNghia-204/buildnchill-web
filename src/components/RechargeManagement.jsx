import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { BiCheck, BiX, BiSearch, BiTime, BiWallet, BiImage, BiRefresh } from 'react-icons/bi';
import '../styles/summer-theme.css';

const RechargeManagement = () => {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('approved');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchRecharges();
  }, [filter]);

  const fetchRecharges = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('recharges')
        .select(`
          *,
          user_profile:profiles!user_id (
            username
          )
        `)
        .order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRecharges(data || []);
    } catch (error) {
      console.error('Error fetching recharges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (recharge, status) => {
    const actionText = status === 'approved' ? 'duyệt' : 'từ chối';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} yêu cầu này?`)) return;

    try {
      if (status === 'approved') {
        const { error } = await supabase.rpc('approve_recharge', {
          p_recharge_id: recharge.id,
          p_admin_id: (await supabase.auth.getUser()).data.user.id
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recharges')
          .update({ status: 'rejected' })
          .eq('id', recharge.id);
        if (error) throw error;
      }

      fetchRecharges();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const filteredRecharges = recharges.filter(r => 
    r.user_profile?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="recharge-management">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
        <h3 className="fw-black text-primary m-0">QUẢN LÝ NẠP TIỀN</h3>
        <button className="btn btn-light border text-primary rounded-3 shadow-sm" onClick={fetchRecharges}>
          <BiRefresh size={22} />
        </button>
      </div>

      <div className="summer-glass p-4 mb-4 border-0 shadow-lg bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <BiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-primary opacity-50" size={20} />
              <input 
                type="text" 
                className="summer-input ps-5 w-100 py-2" 
                placeholder="Tìm tên người chơi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-7 text-md-end">
            <div className="d-flex flex-wrap justify-content-md-end gap-2">
              {[
                { id: 'pending', label: 'CHỜ DUYỆT ⏳' },
                { id: 'approved', label: 'ĐÃ DUYỆT ✅' },
                { id: 'rejected', label: 'TỪ CHỐI ❌' },
                { id: 'all', label: 'TẤT CẢ' }
              ].map(s => (
                <button 
                  key={s.id}
                  onClick={() => setFilter(s.id)}
                  className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${filter === s.id ? 'btn-primary text-white shadow-sm' : 'btn-outline-primary bg-white'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="summer-glass overflow-hidden border-0 bg-white shadow-lg">
        <div className="table-responsive">
          <table className="table summer-table mb-0">
            <thead>
              <tr>
                <th className="ps-4">THỜI GIAN</th>
                <th>NGƯỜI CHƠI</th>
                <th>SỐ TIỀN</th>
                <th>PHƯƠNG THỨC</th>
                <th className="text-center">MINH CHỨNG</th>
                <th className="text-center">TRẠNG THÁI</th>
                <th className="text-end pe-4">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary border-3"></div></td></tr>
              ) : filteredRecharges.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-5 fw-bold text-muted">Không tìm thấy yêu cầu nạp tiền nào. 🏖️</td></tr>
              ) : filteredRecharges.map(r => (
                <tr key={r.id}>
                  <td className="ps-4 align-middle">
                    <div className="small fw-bold text-muted">
                      {new Date(r.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </td>
                  <td className="align-middle">
                    <div className="d-flex align-items-center gap-2">
                      <img src={`https://vzge.me/bust/${r.user_profile?.username}.png`} alt="Skin" style={{ width: '28px' }} />
                      <span className="fw-bold text-dark">{r.user_profile?.username}</span>
                    </div>
                  </td>
                  <td className="align-middle fw-black text-success fs-5">{r.amount.toLocaleString()}đ</td>
                  <td className="align-middle">
                    <span className="badge bg-light text-primary border border-info border-opacity-20 px-3 py-2 rounded-pill small fw-bold">
                      {r.payment_method?.toUpperCase()}
                    </span>
                  </td>
                  <td className="align-middle text-center">
                    {r.proof_image ? (
                      <button onClick={() => setSelectedImage(r.proof_image)} className="btn btn-sm btn-outline-info rounded-pill px-3 border-2 fw-bold" style={{ fontSize: '11px' }}>
                        <BiImage className="me-1" /> XEM ẢNH
                      </button>
                    ) : <span className="text-muted small">N/A</span>}
                  </td>
                  <td className="align-middle text-center">
                    <span className={`badge px-3 py-2 rounded-pill small fw-black ${
                      r.status === 'pending' ? 'bg-warning bg-opacity-10 text-warning' : 
                      r.status === 'approved' ? 'bg-success bg-opacity-10 text-success' : 
                      'bg-danger bg-opacity-10 text-danger'
                    }`}>
                      {r.status === 'pending' ? 'CHỜ DUYỆT' : r.status === 'approved' ? 'ĐÃ DUYỆT' : 'ĐÃ TỪ CHỐI'}
                    </span>
                  </td>
                  <td className="align-middle text-end pe-4">
                    {r.status === 'pending' && (
                      <div className="d-flex justify-content-end gap-2">
                        <button onClick={() => handleAction(r, 'approved')} className="btn btn-sm btn-success rounded-circle p-2 shadow-sm" title="Duyệt"><BiCheck size={20} /></button>
                        <button onClick={() => handleAction(r, 'rejected')} className="btn btn-sm btn-danger rounded-circle p-2 shadow-sm" title="Từ chối"><BiX size={20} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 10001, backdropFilter: 'blur(10px)' }} onClick={() => setSelectedImage(null)}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }}
              className="position-relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelectedImage(null)} className="btn btn-danger rounded-circle position-absolute top-0 end-0 translate-middle shadow-lg" style={{ zIndex: 10 }}><BiX size={24} /></button>
              <img src={selectedImage} alt="Proof" className="rounded-4 shadow-2xl overflow-hidden border border-5 border-white" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RechargeManagement;
