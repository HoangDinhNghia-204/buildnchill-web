import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiPlus, BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';
import { supabase } from '../supabaseClient';
import RichTextEditor from './RichTextEditor';
import '../styles/summer-theme.css';

const ShopProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    command: '',
    price: 0,
    display_price: '',
    category_id: '',
    display_order: 0,
    active: true
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_deleted', false)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_deleted', false)
        .eq('active', true)
        .order('display_order');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setImageFile(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      command: '',
      price: 0,
      display_price: '',
      category_id: categories[0]?.id || '',
      display_order: products.length,
      active: true
    });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setImageFile(null);
    setFormData({
      name: product.name,
      description: product.description || '',
      image_url: product.image_url || '',
      command: product.command,
      price: product.price || 0,
      display_price: product.display_price || '',
      category_id: product.category_id || '',
      display_order: product.display_order || 0,
      active: product.active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_deleted: true })
        .eq('id', id);
      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
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
    if (!imageFile) return formData.image_url;

    try {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return formData.image_url;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalImageUrl = await uploadImage();
      const finalFormData = { ...formData, image_url: finalImageUrl };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(finalFormData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([finalFormData]);
        if (error) throw error;
      }
      setShowModal(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <div className="shop-products-management">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
        <h3 className="fw-black text-primary m-0">QUẢN LÝ SẢN PHẨM</h3>
        <button
          className="summer-button py-2 px-4 shadow-sm"
          onClick={handleAddNew}
        >
          <BiPlus size={20} className="me-1" /> Thêm Sản Phẩm
        </button>
      </div>

      <div className="summer-glass overflow-hidden border-0 shadow-lg mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table summer-table mb-0">
            <thead>
              <tr>
                <th className="ps-4">ẢNH</th>
                <th>TÊN SẢN PHẨM</th>
                <th>DANH MỤC</th>
                <th>GIÁ BÁN</th>
                <th className="text-center">THỨ TỰ</th>
                <th className="text-center">TRẠNG THÁI</th>
                <th className="text-end pe-4">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td className="ps-4 align-middle">
                    <div className="rounded-3 p-1 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', backgroundColor: 'var(--bg-sand-light)' }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-100 h-100 object-fit-contain" />
                      ) : (
                        <span className="fs-4">📦</span>
                      )}
                    </div>
                  </td>
                  <td className="align-middle fw-bold text-dark">{product.name}</td>
                  <td className="align-middle text-muted">{product.categories?.name || '-'}</td>
                  <td className="align-middle fw-black text-primary">
                    {product.display_price || product.price?.toLocaleString('vi-VN') + ' VNĐ'}
                  </td>
                  <td className="align-middle text-center fw-bold">{product.display_order}</td>
                  <td className="align-middle text-center">
                    <span className={`badge rounded-pill ${product.active ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                      {product.active ? 'Hoạt động' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td className="align-middle text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-sm btn-info text-white rounded-circle p-2" onClick={() => handleEdit(product)}>
                        <BiEdit size={16} />
                      </button>
                      <button className="btn btn-sm btn-danger rounded-circle p-2" onClick={() => handleDelete(product.id)}>
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
            style={{ backgroundColor: 'var(--bg-card)', maxWidth: '800px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-primary d-flex justify-content-between align-items-center" style={{ color: '#fff' }}>
              <h4 className="m-0 fw-black" style={{ color: '#fff' }}>{editingProduct ? 'SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}</h4>
              <button className="btn btn-link text-white p-0" onClick={() => setShowModal(false)}><BiX size={28} /></button>
            </div>

            <div className="p-4 overflow-auto flex-grow-1">
              <form onSubmit={handleSubmit} id="productForm">
                <div className="row g-4">
                  <div className="col-md-7">
                    <div className="mb-4">
                      <label className="summer-label">TÊN SẢN PHẨM</label>
                      <input type="text" className="summer-input w-100" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="summer-label">DANH MỤC</label>
                      <select className="summer-input w-100" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required>
                        <option value="">Chọn danh mục</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="mb-4">
                      <label className="summer-label">ẢNH SẢN PHẨM</label>
                      <div className="d-flex flex-column gap-3">
                        <div className="summer-glass p-2 d-flex align-items-center justify-content-center" style={{ height: '140px', backgroundColor: 'var(--bg-sand-light)' }}>
                          {(imageFile || formData.image_url) ? (
                            <img
                              src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                              alt="Preview"
                              className="h-100 w-100 object-fit-contain"
                            />
                          ) : (
                            <div className="text-center text-muted">
                              <BiPlus size={40} className="mb-2" />
                              <p className="small m-0">Chưa có ảnh</p>
                            </div>
                          )}
                        </div>
                        <input type="file" className="form-control form-control-sm" accept="image/*" onChange={handleImageChange} />
                        <input type="url" className="summer-input w-100 py-2 small" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="Hoặc nhập URL ảnh..." />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="summer-label">MÔ TẢ CHI TIẾT</label>
                  <div className="summer-glass border p-1">
                    <RichTextEditor
                      value={formData.description}
                      onChange={(val) => setFormData({ ...formData, description: val })}
                      placeholder="Mô tả các tính năng, quyền lợi của sản phẩm..."
                    />
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="summer-label">LỆNH TRONG GAME</label>
                    <input type="text" className="summer-input w-100" value={formData.command} onChange={(e) => setFormData({ ...formData, command: e.target.value })} required placeholder="Ví dụ: give {username} diamond 1" />
                    <small className="text-muted mt-1 d-block">Dùng <code>{`{username}`}</code> để tự động điền tên player.</small>
                  </div>
                  <div className="col-md-6">
                    <label className="summer-label">GIÁ TIỀN (VNĐ)</label>
                    <input type="number" className="summer-input w-100" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required min="0" />
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="summer-label">HIỂN THỊ GIÁ (TÙY CHỌN)</label>
                    <input type="text" className="summer-input w-100" value={formData.display_price} onChange={(e) => setFormData({ ...formData, display_price: e.target.value })} placeholder="VD: 50.000 VNĐ hoặc FREE" />
                  </div>
                  <div className="col-md-6">
                    <label className="summer-label">THỨ TỰ HIỂN THỊ</label>
                    <input type="number" className="summer-input w-100" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="custom-toggle-switch">
                      <input
                        type="checkbox"
                        id="productActive"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                      <label htmlFor="productActive" />
                    </div>
                    <label className="fw-bold text-primary mb-0" htmlFor="productActive">Sản phẩm đang kinh doanh</label>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 d-flex gap-3 border-top" style={{ backgroundColor: 'var(--bg-sand-light)' }}>
              <button
                type="submit"
                form="productForm"
                className="summer-button flex-grow-1 py-3"
                disabled={uploading}
              >
                {uploading ? 'ĐANG TẢI ẢNH...' : (editingProduct ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM SẢN PHẨM')}
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

export default ShopProductsManagement;
