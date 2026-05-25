import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSearch, BiEdit, BiTrash, BiCheck, BiX, BiUser, BiShieldAlt, BiRefresh } from 'react-icons/bi';
import '../styles/summer-theme.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    role: 'user',
    new_password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username || '',
      role: user.role || 'user',
      new_password: ''
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          role: editForm.role
        })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;
      
      if (editForm.new_password.trim()) {
        if (editForm.new_password.length < 6) {
          alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
          return;
        }

        const { data: passwordResult, error: passwordError } = await supabase.rpc('admin_force_update_password', {
          p_user_id: editingUser.id,
          p_new_password: editForm.new_password
        });

        if (passwordError) throw passwordError;
        if (!passwordResult.success) throw new Error(passwordResult.message);
      }
      
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Thao tác này KHÔNG THỂ hoàn tác.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
        <h3 className="fw-black text-primary m-0">QUẢN LÝ THÀNH VIÊN</h3>
        <button className="btn btn-light border text-primary rounded-3 shadow-sm" onClick={fetchUsers}>
          <BiRefresh size={22} />
        </button>
      </div>

      <div className="summer-glass p-4 mb-4 border-0 shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="position-relative">
          <BiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-primary opacity-50" size={22} />
          <input
            type="text"
            className="summer-input ps-5 w-100 py-2"
            placeholder="Tìm kiếm theo username hoặc ID người chơi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="summer-glass overflow-hidden border-0 shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table summer-table mb-0">
            <thead>
              <tr>
                <th className="ps-4">AVATAR</th>
                <th>USERNAME</th>
                <th>HỌ TÊN</th>
                <th className="text-center">VAI TRÒ</th>
                <th>NGÀY TẠO</th>
                <th className="text-end pe-4">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary border-3"></div></td></tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="ps-4 align-middle">
                      <div className="rounded-3 p-1 d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '45px', height: '45px', backgroundColor: 'var(--bg-sand-light)' }}>
                        <img 
                          src={`https://vzge.me/bust/${user.username}.png`} 
                          alt="Skin" 
                          className="w-100 h-100 object-fit-contain"
                        />
                      </div>
                    </td>
                    <td className="align-middle fw-black text-dark fs-5">{user.username}</td>
                    <td className="align-middle text-muted">{user.full_name || '-'}</td>
                    <td className="align-middle text-center">
                      <span className={`badge rounded-pill px-3 py-2 fw-black ${
                        user.role === 'admin' ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20' : 
                        'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20'
                      }`}>
                        {user.role === 'admin' ? 'QUẢN TRỊ' : 'NGƯỜI CHƠI'}
                      </span>
                    </td>
                    <td className="align-middle text-muted small">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="align-middle text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-info text-white rounded-circle p-2" onClick={() => handleEdit(user)}>
                          <BiEdit size={18} />
                        </button>
                        <button className="btn btn-sm btn-danger rounded-circle p-2" onClick={() => handleDelete(user.id)}>
                          <BiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted fw-bold">Không tìm thấy người dùng nào. 🏖️</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editingUser && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 10000, backdropFilter: 'blur(8px)' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="summer-glass p-0 border-0 overflow-hidden shadow-2xl"
              style={{ backgroundColor: 'var(--bg-card)', maxWidth: '500px', width: '100%' }}
            >
              <div className="p-4 bg-primary d-flex justify-content-between align-items-center" style={{ color: '#fff' }}>
                <h4 className="m-0 fw-black" style={{ color: '#fff' }}>SỬA THÔNG TIN THÀNH VIÊN</h4>
                <button className="btn btn-link text-white p-0" onClick={() => setEditingUser(null)}><BiX size={28} /></button>
              </div>
              
              <div className="p-4 text-center" style={{ backgroundColor: 'var(--bg-sand-light)' }}>
                <div className="d-inline-block rounded-circle p-3 shadow-sm border border-4 mb-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-card)' }}>
                  <img 
                    src={`https://vzge.me/bust/${editForm.username}.png`} 
                    alt="Skin" 
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  />
                </div>
                <h5 className="fw-black text-dark m-0">{editForm.username}</h5>
                <p className="text-muted small">ID: {editingUser.id}</p>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <label className="summer-label">TÊN NGƯỜI DÙNG (USERNAME)</label>
                  <input
                    type="text"
                    className="summer-input w-100"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="summer-label">VAI TRÒ TRÊN WEBSITE</label>
                  <select
                    className="summer-input w-100"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="user">Người chơi (Player)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="summer-label">THIẾT LẬP MẬT KHẨU MỚI</label>
                  <input
                    type="password"
                    className="summer-input w-100"
                    value={editForm.new_password}
                    onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })}
                    placeholder="Bỏ trống nếu không muốn đổi mật khẩu..."
                  />
                  <small className="text-muted d-block mt-1">Lưu ý: Mật khẩu mới tối thiểu 6 ký tự.</small>
                </div>

                <div className="d-flex gap-3 pt-2">
                  <button className="summer-button flex-grow-1 py-3" onClick={handleUpdate}>
                    <BiCheck className="me-2" size={20} /> CẬP NHẬT
                  </button>
                  <button className="summer-button-outline px-4 py-3" onClick={() => setEditingUser(null)}>HỦY</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
