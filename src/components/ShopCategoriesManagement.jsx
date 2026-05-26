import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiPlus, BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';
import { supabase } from '../supabaseClient';
import '../styles/summer-theme.css';

const ShopCategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    display_order: 0,
    active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_deleted', false)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Lỗi tải danh sách danh mục: ' + error.message);
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      display_order: categories.length,
      active: true
    });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      display_order: category.display_order || 0,
      active: category.active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_deleted: true })
        .eq('id', id);
      if (error) throw error;
      alert('Đã xóa danh mục thành công!');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Lỗi xóa danh mục: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ ...formData, is_deleted: false }]);
        if (error) throw error;
      }
      alert(editingCategory ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!');
      setShowModal(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Lỗi lưu danh mục: ' + error.message);
    }
  };

  return (
    <div className="shop-categories-management">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
        <h3 className="fw-black text-primary m-0">QUẢN LÝ DANH MỤC</h3>
        <button
          className="summer-button py-2 px-4 shadow-sm"
          onClick={handleAddNew}
        >
          <BiPlus size={20} className="me-1" /> Thêm Danh Mục
        </button>
      </div>

      <div className="summer-glass overflow-hidden border-0 shadow-lg mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table summer-table mb-0">
            <thead>
              <tr>
                <th className="ps-4">ICON</th>
                <th>TÊN DANH MỤC</th>
                <th>MÔ TẢ</th>
                <th className="text-center">THỨ TỰ</th>
                <th className="text-center">TRẠNG THÁI</th>
                <th className="text-end pe-4">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td className="ps-4 align-middle">
                    <div className="rounded-3 p-1 d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-sand-light)' }}>
                      <span className="fs-5">{category.icon || '📦'}</span>
                    </div>
                  </td>
                  <td className="align-middle fw-bold text-dark">{category.name}</td>
                  <td className="align-middle text-muted">{category.description || '-'}</td>
                  <td className="align-middle text-center fw-bold">{category.display_order}</td>
                  <td className="align-middle text-center">
                    <span className={`badge rounded-pill ${category.active ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                      {category.active ? 'Hoạt động' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td className="align-middle text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-sm btn-info text-white rounded-circle p-2" onClick={() => handleEdit(category)}>
                        <BiEdit size={16} />
                      </button>
                      <button className="btn btn-sm btn-danger rounded-circle p-2" onClick={() => handleDelete(category.id)}>
                        <BiTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 9999, backdropFilter: 'blur(5px)' }} onClick={() => setShowModal(false)}>
          <motion.div
            className="summer-glass p-0 border-0 overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'var(--bg-card)', maxWidth: '600px', width: '100%' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-primary d-flex justify-content-between align-items-center" style={{ color: '#fff' }}>
              <h4 className="m-0 fw-black" style={{ color: '#fff' }}>{editingCategory ? 'SỬA DANH MỤC' : 'THÊM DANH MỤC MỚI'}</h4>
              <button className="btn btn-link text-white p-0" onClick={() => setShowModal(false)}><BiX size={28} /></button>
            </div>

            <div className="p-4">
              <form onSubmit={handleSubmit} id="categoryForm">
                <div className="mb-4">
                  <label className="summer-label">TÊN DANH MỤC *</label>
                  <input type="text" className="summer-input w-100" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="mb-4">
                  <label className="summer-label">MÔ TẢ</label>
                  <textarea className="summer-input w-100" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả ngắn về danh mục này..." />
                </div>
                <div className="mb-4">
                  <label className="summer-label">ICON / EMOJI</label>
                  <div className="d-flex gap-3 align-items-center">
                    <div className="summer-glass p-1 d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-sand-light)' }}>
                      <span className="fs-3">{formData.icon || '📦'}</span>
                    </div>
                    <input type="text" className="summer-input flex-grow-1" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="Nhập Emoji (VD: ⚔️, 🛡️, 💎)..." />
                  </div>
                </div>
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="summer-label">THỨ TỰ HIỂN THỊ</label>
                    <input type="number" className="summer-input w-100" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="col-md-6 d-flex align-items-end">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="custom-toggle-switch">
                        <input
                          type="checkbox"
                          id="categoryActive"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        />
                        <label htmlFor="categoryActive" />
                      </div>
                      <label className="fw-bold text-primary mb-0" htmlFor="categoryActive">Đang hoạt động</label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 d-flex gap-3 border-top" style={{ backgroundColor: 'var(--bg-sand-light)' }}>
              <button
                type="submit"
                form="categoryForm"
                className="summer-button flex-grow-1 py-3"
              >
                {editingCategory ? 'CẬP NHẬT DANH MỤC' : 'THÊM DANH MỤC'}
              </button>
              <button
                type="button"
                className="summer-button-outline px-4 py-3"
                onClick={() => setShowModal(false)}
              >
                HỦY
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ShopCategoriesManagement;
