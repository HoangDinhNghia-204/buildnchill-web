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
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setImageFile(null);
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
    setImageFile(null);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      display_order: category.display_order || 0,
      active: category.active !== false
    });
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Kích thước ảnh tối đa 10MB!');
        return;
      }
      setImageFile(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.icon;

    try {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('categories')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('categories')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return formData.icon;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_deleted: true })
        .eq('id', id);
      if (error) throw error;
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalIconUrl = await uploadImage();
      const finalFormData = { ...formData, icon: finalIconUrl };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(finalFormData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([finalFormData]);
        if (error) throw error;
      }
      setShowModal(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
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

      <div className="summer-glass overflow-hidden border-0 bg-white shadow-lg mb-4">
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
                    <div className="rounded-3 bg-light p-1 d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '40px', height: '40px' }}>
                      {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                        <img src={category.icon} alt={category.name} className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <span className="fs-5">{category.icon || '📦'}</span>
                      )}
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
            className="summer-glass p-0 border-0 bg-white overflow-hidden shadow-2xl" 
            style={{ maxWidth: '600px', width: '100%' }} 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="m-0 fw-black">{editingCategory ? 'SỬA DANH MỤC' : 'THÊM DANH MỤC MỚI'}</h4>
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
                  <label className="summer-label">ICON / HÌNH ẢNH</label>
                  <div className="d-flex gap-3 align-items-center mb-3">
                    <div className="summer-glass p-1 d-flex align-items-center justify-content-center bg-light overflow-hidden" style={{ width: '60px', height: '60px' }}>
                      {(imageFile || (formData.icon && (formData.icon.startsWith('http') || formData.icon.startsWith('/')))) ? (
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.icon} 
                          alt="Preview" 
                          className="h-100 w-100 object-fit-cover"
                        />
                      ) : (
                        <span className="fs-3">{formData.icon || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <input type="file" className="form-control form-control-sm mb-2" accept="image/*" onChange={handleImageChange} />
                      <input type="text" className="summer-input w-100 py-2 small" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="Nhập Emoji hoặc URL ảnh..." />
                    </div>
                  </div>
                </div>
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="summer-label">THỨ TỰ HIỂN THỊ</label>
                    <input type="number" className="summer-input w-100" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="col-md-6 d-flex align-items-end">
                    <div className="form-check p-0 d-flex align-items-center gap-2 mb-2">
                      <input 
                        className="form-check-input m-0" 
                        type="checkbox" 
                        id="categoryActive"
                        style={{ width: '20px', height: '20px' }}
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                      <label className="fw-bold text-primary mb-0" htmlFor="categoryActive">Đang hoạt động</label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 bg-light d-flex gap-3 border-top">
              <button 
                type="submit" 
                form="categoryForm" 
                className="summer-button flex-grow-1 py-3" 
                disabled={uploading}
              >
                {uploading ? 'ĐANG TẢI...' : (editingCategory ? 'CẬP NHẬT DANH MỤC' : 'THÊM DANH MỤC')}
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
