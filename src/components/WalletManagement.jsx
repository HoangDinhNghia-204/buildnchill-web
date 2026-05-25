import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { BiWallet, BiPlus, BiMinus, BiSearch, BiHistory, BiRefresh, BiUser } from 'react-icons/bi';
import '../styles/summer-theme.css';

const WalletManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchUsers(true);

    const profileChannel = supabase.channel('admin_profile_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers(false);
      })
      .subscribe();

    const walletChannel = supabase.channel('admin_wallet_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => {
        fetchUsers(false);
      })
      .subscribe();

    const handleUpdate = () => {
      fetchUsers(false);
    };

    window.addEventListener('wallet_updated', handleUpdate);
    return () => {
      window.removeEventListener('wallet_updated', handleUpdate);
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(walletChannel);
    };
  }, [selectedUser?.id]);

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          role,
          wallets (
            id,
            balance,
            user_id
          )
        `)
        .order('username');
      
      if (error) throw error;
      
      const processedData = data?.map(user => {
        let balance = 0;
        let walletId = null;

        if (Array.isArray(user.wallets)) {
          balance = user.wallets[0]?.balance || 0;
          walletId = user.wallets[0]?.id;
        } else if (user.wallets) {
          balance = user.wallets.balance || 0;
          walletId = user.wallets.id;
        }

        return {
          ...user,
          display_balance: balance,
          wallet_id: walletId
        };
      });

      setUsers(processedData || []);
      
      if (selectedUser) {
        const updatedUser = (processedData || []).find(u => u.id === selectedUser.id);
        if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(selectedUser)) {
          setSelectedUser(updatedUser);
          if (updatedUser.wallet_id) {
            fetchTransactions(updatedUser.wallet_id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchTransactions = async (walletId) => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAdjustBalance = async (type) => {
    if (!selectedUser || !adjustAmount || !adjustReason) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const amount = parseInt(adjustAmount);
    const finalAmount = type === 'plus' ? amount : -amount;

    try {
      const { error } = await supabase.rpc('admin_adjust_balance', {
        p_user_id: selectedUser.id,
        p_amount: finalAmount,
        p_type: 'admin_adjustment',
        p_note: adjustReason
      });

      if (error) throw error;

      setAdjustAmount('');
      setAdjustReason('');
      fetchUsers();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="wallet-management">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
        <h3 className="fw-black text-primary m-0">QUẢN LÝ VÍ TIỀN</h3>
        <button className="btn btn-light border text-primary rounded-3 shadow-sm" onClick={() => fetchUsers(true)}>
          <BiRefresh size={22} />
        </button>
      </div>

      <div className="row g-4">
        <div className="col-md-5">
          <div className="summer-glass p-4 h-100 border-0 shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h5 className="mb-4 fw-black text-dark d-flex align-items-center gap-2">
              <BiSearch size={22} className="text-primary" /> TÌM NGƯỜI CHƠI
            </h5>
            <div className="position-relative mb-4">
              <input 
                type="text" 
                className="summer-input w-100 py-2" 
                placeholder="Nhập tên nhân vật..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="user-list overflow-auto pe-2" style={{ maxHeight: '450px' }}>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary border-3"></div></div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <motion.div 
                    key={user.id} 
                    whileHover={{ x: 5 }}
                    className={`p-3 rounded-4 mb-2 cursor-pointer transition-all border-2 d-flex align-items-center justify-content-between ${
                      selectedUser?.id === user.id ? 'bg-primary text-white border-primary shadow-md' : 'border-transparent'
                    }`}
                    onClick={() => {
                      setSelectedUser(user);
                      if (user.wallet_id) fetchTransactions(user.wallet_id);
                    }}
                    style={{ cursor: 'pointer', backgroundColor: selectedUser?.id === user.id ? undefined : 'var(--bg-sand-light)' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img src={`https://vzge.me/bust/${user.username}.png`} alt="Skin" style={{ width: '32px' }} />
                      <span className="fw-bold">{user.username}</span>
                    </div>
                    <span className={`fw-black ${selectedUser?.id === user.id ? 'text-white' : 'text-primary'}`}>
                      {(user.display_balance || 0).toLocaleString()}đ
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">Không tìm thấy người chơi.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div 
                key={selectedUser.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="d-flex flex-column gap-4"
              >
                <div className="summer-glass p-4 border-0 shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <h5 className="mb-4 fw-black text-dark d-flex align-items-center gap-2">
                    <BiWallet size={22} className="text-primary" /> ĐIỀU CHỈNH: {selectedUser.username}
                  </h5>
                  
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="summer-label">SỐ TIỀN (VNĐ)</label>
                      <input 
                        type="number" 
                        className="summer-input w-100" 
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        placeholder="VD: 50000"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="summer-label">LÝ DO ĐIỀU CHỈNH</label>
                      <input 
                        className="summer-input w-100" 
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        placeholder="VD: Hoàn tiền, Thưởng sự kiện..."
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <button 
                        onClick={() => handleAdjustBalance('plus')} 
                        className="summer-button w-100 py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                      >
                        <BiPlus size={20} /> CỘNG TIỀN
                      </button>
                    </div>
                    <div className="col-6">
                      <button 
                        onClick={() => handleAdjustBalance('minus')} 
                        className="summer-button-outline w-100 py-3 d-flex align-items-center justify-content-center gap-2 border-danger text-danger shadow-sm"
                        style={{ backgroundColor: 'transparent' }}
                      >
                        <BiMinus size={20} /> TRỪ TIỀN
                      </button>
                    </div>
                  </div>
                </div>

                <div className="summer-glass p-4 border-0 shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <h5 className="mb-4 fw-black text-dark d-flex align-items-center gap-2">
                    <BiHistory size={22} className="text-primary" /> GIAO DỊCH GẦN ĐÂY
                  </h5>
                  <div className="table-responsive">
                    <table className="table summer-table mb-0">
                      <thead>
                        <tr>
                          <th>THỜI GIAN</th>
                          <th className="text-center">BIẾN ĐỘNG</th>
                          <th className="text-end">LÝ DO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map(t => (
                            <tr key={t.id}>
                              <td className="small text-muted align-middle">{new Date(t.created_at).toLocaleString('vi-VN')}</td>
                              <td className={`align-middle text-center fw-black fs-6 ${t.amount > 0 ? 'text-success' : 'text-danger'}`}>
                                {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}đ
                              </td>
                              <td className="align-middle text-end text-truncate fw-medium" style={{ maxWidth: '200px' }} title={t.note}>{t.note}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-4 text-muted small fw-bold">Chưa có lịch sử giao dịch. 🌴</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="summer-glass p-5 text-center text-muted h-100 d-flex flex-column align-items-center justify-content-center shadow-lg border-0 border-dashed border-2" style={{ backgroundColor: 'var(--bg-card)' }}>
                <BiUser size={60} className="mb-3 opacity-20" />
                <p className="fw-bold m-0">Vui lòng chọn một người chơi để xem chi tiết và điều chỉnh số dư ví.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WalletManagement;
