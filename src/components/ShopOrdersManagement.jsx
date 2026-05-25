import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiCheckCircle, BiXCircle, BiShow, BiRefresh, BiTrash, BiPackage, BiX } from 'react-icons/bi';
import { supabase } from '../supabaseClient';
import { generateOrderCode } from '../utils/helpers';
import '../styles/summer-theme.css';

const ShopOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select('*, products(name, display_price), categories(name)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ is_deleted: true })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*, products(name, display_price), categories(name)')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) throw new Error('Không tìm thấy đơn hàng!');

      const updateData = { status: newStatus };

      if (newStatus === 'paid' && order.command) {
        updateData.paid_at = new Date().toISOString();
        
        await supabase.from('pending_commands').insert([
          { command: order.command, mc_username: order.mc_username, status: 'pending' }
        ]);

        const notifyMsg = `{"text":"","extra":[{"text":"[","color":"dark_gray"},{"text":"\ud83e\udeb8","color":"light_purple","bold":true},{"text":"]","color":"dark_gray"},{"text":" BnC-Shop","color":"light_purple","bold":true},{"text":" \u2192 ","color":"dark_gray"},{"text":"Giao thành công đơn hàng ","color":"green"},{"text":"${order.product || order.products?.name}","color":"aqua"},{"text":". Cảm ơn bạn đã ủng hộ!","color":"green"}]}`;
        await supabase.from('pending_commands').insert([
          { command: `tellraw ${order.mc_username} ${notifyMsg}`, mc_username: order.mc_username, status: 'pending' }
        ]);
      }

      if (newStatus === 'delivered') {
        updateData.delivered = true;
      }

      const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
      if (error) throw error;

      loadOrders();
      if (showModal) setShowModal(false);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const getStatusBadge = (order) => {
    if (order.delivered) return <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-20 px-3 py-2">ĐÃ GIAO XONG 📦</span>;
    if (order.status === 'paid') return <span className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-20 px-3 py-2">ĐÃ THANH TOÁN ✅</span>;
    return <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20 px-3 py-2">CHỜ NẠP ⏳</span>;
  };

  return (
    <div className="shop-orders-management">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
        <h3 className="fw-black text-primary m-0">QUẢN LÝ ĐƠN HÀNG</h3>
        <div className="d-flex gap-2">
          <select 
            className="summer-input py-2 px-3 small fw-bold text-primary" 
            style={{ width: 'auto', minWidth: '160px' }}
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">TẤT CẢ ĐƠN</option>
            <option value="pending">CHỜ THANH TOÁN</option>
            <option value="paid">ĐÃ THANH TOÁN</option>
            <option value="delivered">ĐÃ GIAO XONG</option>
          </select>
          <button className="btn btn-light border text-primary rounded-3 shadow-sm" onClick={loadOrders}>
            <BiRefresh size={22} />
          </button>
        </div>
      </div>

      <div className="summer-glass overflow-hidden border-0 shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table summer-table mb-0">
            <thead>
              <tr>
                <th className="ps-4">MÃ ĐƠN</th>
                <th>NGƯỜI CHƠI</th>
                <th>SẢN PHẨM</th>
                <th>GIÁ TIỀN</th>
                <th className="text-center">TRẠNG THÁI</th>
                <th>THỜI GIAN</th>
                <th className="text-end pe-4">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="ps-4 align-middle">
                    <span className="fw-black text-primary small">#{generateOrderCode(order.id)}</span>
                  </td>
                  <td className="align-middle fw-bold text-dark">{order.mc_username}</td>
                  <td className="align-middle">
                    <div className="fw-medium text-truncate" style={{ maxWidth: '200px' }}>
                      {order.product || order.products?.name}
                    </div>
                  </td>
                  <td className="align-middle fw-black text-primary">{order.price?.toLocaleString()}đ</td>
                  <td className="align-middle text-center">{getStatusBadge(order)}</td>
                  <td className="align-middle small text-muted">
                    {new Date(order.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="align-middle text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-sm btn-info text-white rounded-circle p-2" onClick={() => handleViewOrder(order)}>
                        <BiShow size={18} />
                      </button>
                      <button className="btn btn-sm btn-danger rounded-circle p-2" onClick={() => handleDeleteOrder(order.id)}>
                        <BiTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted fw-bold">Chưa có đơn hàng nào được ghi nhận. 🏖️</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && selectedOrder && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 10000, backdropFilter: 'blur(8px)' }}>
            <motion.div 
              className="summer-glass p-0 border-0 overflow-hidden shadow-2xl" 
              style={{ backgroundColor: 'var(--bg-card)', maxWidth: '600px', width: '100%' }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className="p-4 bg-primary d-flex justify-content-between align-items-center" style={{ color: '#fff' }}>
                <h4 className="m-0 fw-black" style={{ color: '#fff' }}>CHỈNH SỬA ĐƠN HÀNG</h4>
                <button className="btn btn-link text-white p-0" onClick={() => setShowModal(false)}><BiX size={28} /></button>
              </div>

              <div className="p-4">
                <div className="row g-4 mb-4">
                  <div className="col-6">
                    <p className="summer-label mb-1">MÃ ĐƠN HÀNG</p>
                    <p className="fw-black text-primary fs-5">#{generateOrderCode(selectedOrder.id)}</p>
                  </div>
                  <div className="col-6">
                    <p className="summer-label mb-1">NGƯỜI CHƠI</p>
                    <div className="d-flex align-items-center gap-2">
                      <img src={`https://vzge.me/bust/${selectedOrder.mc_username}.png`} alt="Skin" style={{ width: '32px' }} />
                      <span className="fw-bold text-dark">{selectedOrder.mc_username}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <p className="summer-label mb-1">SẢN PHẨM</p>
                    <div className="p-3 rounded-3 fw-bold border-start border-4 border-primary" style={{ backgroundColor: 'var(--bg-sand-light)' }}>
                      {selectedOrder.product || selectedOrder.products?.name}
                    </div>
                  </div>
                  <div className="col-6">
                    <p className="summer-label mb-1">GIÁ THANH TOÁN</p>
                    <p className="fw-black text-success fs-4 m-0">{selectedOrder.price?.toLocaleString()}đ</p>
                  </div>
                  <div className="col-6">
                    <p className="summer-label mb-1">TRẠNG THÁI</p>
                    <div>{getStatusBadge(selectedOrder)}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="summer-label mb-1">LỆNH THỰC THI (GAME COMMAND)</p>
                  <div className="p-3 bg-dark text-info rounded-3 font-monospace small position-relative overflow-hidden">
                    <div className="position-absolute top-0 end-0 p-1 bg-secondary bg-opacity-20 text-white-50 px-2" style={{ fontSize: '10px' }}>SYSTEM</div>
                    {selectedOrder.command}
                  </div>
                </div>

                <div className="d-flex gap-3 pt-2">
                  {selectedOrder.status === 'pending' && (
                    <button className="summer-button flex-grow-1 py-3" onClick={() => handleUpdateStatus(selectedOrder.id, 'paid')}>
                      <BiCheckCircle size={20} className="me-2" /> DUYỆT THANH TOÁN
                    </button>
                  )}
                  {selectedOrder.status === 'paid' && !selectedOrder.delivered && (
                    <button className="summer-button flex-grow-1 py-3 bg-success border-0" onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}>
                      <BiPackage size={20} className="me-2" /> XÁC NHẬN ĐÃ GIAO
                    </button>
                  )}
                  <button className="summer-button-outline px-4 py-3" onClick={() => setShowModal(false)}>ĐÓNG</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopOrdersManagement;
