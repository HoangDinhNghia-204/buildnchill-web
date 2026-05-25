import { useState } from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { BiPlus, BiTrash, BiEdit, BiSave, BiX, BiChevronUp, BiChevronDown } from 'react-icons/bi';
import '../styles/summer-theme.css';

const CarouselManagement = () => {
  const { carouselImages, addCarouselImage, updateCarouselImage, deleteCarouselImage } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ image_url: '', display_order: 0, is_active: true });

  const handleAdd = async (e) => {
    e.preventDefault();
    const success = await addCarouselImage(formData);
    if (success) {
      setIsAdding(false);
      setFormData({ image_url: '', display_order: 0, is_active: true });
    }
  };

  const handleUpdate = async (id) => {
    const success = await updateCarouselImage(id, formData);
    if (success) {
      setEditingId(null);
    }
  };

  const startEdit = (img) => {
    setEditingId(img.id);
    setFormData({ image_url: img.image_url, display_order: img.display_order, is_active: img.is_active });
  };

  const moveOrder = async (img, direction) => {
    const newOrder = direction === 'up' ? img.display_order - 1 : img.display_order + 1;
    await updateCarouselImage(img.id, { display_order: newOrder });
  };

  return (
    <div className="carousel-management">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-info border-opacity-10">
        <h3 className="fw-black text-primary m-0">QUẢN LÝ CAROUSEL</h3>
        <button 
          className="summer-button py-2 px-4 shadow-sm"
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
            setFormData({ image_url: '', display_order: carouselImages.length, is_active: true });
          }}
        >
          {isAdding ? <><BiX size={20} className="me-1" /> Hủy</> : <><BiPlus size={20} className="me-1" /> Thêm Ảnh</>}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="summer-glass p-4 mb-5 shadow-xl border-0 bg-white"
        >
          <form onSubmit={handleAdd}>
            <div className="mb-4">
              <label className="summer-label">URL HÌNH ẢNH</label>
              <input 
                type="text" 
                className="summer-input w-100" 
                placeholder="Nhập link ảnh..."
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                required
              />
            </div>
            <div className="row g-4">
              <div className="col-md-6 mb-3">
                <label className="summer-label">THỨ TỰ HIỂN THỊ</label>
                <input 
                  type="number" 
                  className="summer-input w-100" 
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                />
              </div>
              <div className="col-md-6 mb-3 d-flex align-items-center">
                <div className="form-check p-0 d-flex align-items-center gap-2">
                  <input 
                    className="form-check-input m-0" 
                    type="checkbox" 
                    id="isActiveCheck"
                    style={{ width: '20px', height: '20px' }}
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <label className="fw-bold text-primary mb-0" htmlFor="isActiveCheck">
                    Hoạt động
                  </label>
                </div>
              </div>
            </div>
            <button type="submit" className="summer-button w-100 py-3 mt-4">
              <BiSave size={20} className="me-1" /> LƯU ẢNH CAROUSEL
            </button>
          </form>
        </motion.div>
      )}

      <div className="row g-4">
        {carouselImages.map((img) => (
          <div key={img.id} className="col-md-6 col-xl-4">
            <div className="summer-glass p-0 overflow-hidden h-100 shadow-lg border-0 bg-white d-flex flex-column">
              <div className="position-relative" style={{ height: '180px' }}>
                <img 
                  src={img.image_url} 
                  className="w-100 h-100 object-fit-cover" 
                  alt="Carousel" 
                />
                {!img.is_active && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                    <span className="badge bg-danger px-3 py-2">ĐANG ẨN</span>
                  </div>
                )}
              </div>
              <div className="p-4 mt-auto">
                {editingId === img.id ? (
                  <div className="d-flex flex-column gap-3">
                    <input 
                      type="text" 
                      className="summer-input w-100 py-2" 
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    />
                    <div className="d-flex gap-2">
                      <button className="summer-button py-2 flex-grow-1" onClick={() => handleUpdate(img.id)}>
                        <BiSave size={18} />
                      </button>
                      <button className="summer-button-outline py-2 flex-grow-1" onClick={() => setEditingId(null)}>
                        <BiX size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-info px-3 me-2">VỊ TRÍ: {img.display_order}</span>
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-light border" onClick={() => moveOrder(img, 'up')} title="Dịch lên">
                        <BiChevronUp size={20} />
                      </button>
                      <button className="btn btn-sm btn-light border" onClick={() => moveOrder(img, 'down')} title="Dịch xuống">
                        <BiChevronDown size={20} />
                      </button>
                      <button className="btn btn-sm btn-outline-info" onClick={() => startEdit(img)}>
                        <BiEdit size={18} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCarouselImage(img.id)}>
                        <BiTrash size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {carouselImages.length === 0 && (
        <div className="text-center py-5 summer-glass bg-white bg-opacity-50 border-dashed border-2">
          <p className="fw-black text-muted m-0">Chưa có ảnh nào trong carousel. Vui lòng thêm ảnh mới. 🏝️</p>
        </div>
      )}
    </div>
  );
};

export default CarouselManagement;
