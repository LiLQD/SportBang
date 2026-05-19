import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fieldService } from '../../services/api';
import {
  ArrowLeft,
  Save,
  Loader2,
  MapPin,
  Type,
  DollarSign,
  Info,
  CheckSquare,
  Image as ImageIcon,
  Plus,
  X,
  Activity
} from 'lucide-react';

const EditField = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    field_name: '',
    address: '',
    field_type: 'Sân 5 người',
    price_per_hour: 0,
    description: '',
    amenities: [],
    images: [],
    status: 'active'
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchField = async () => {
      try {
        const res = await fieldService.getFieldById(id);
        const field = res.data.data || res.data;
        setFormData({
          field_name: field.field_name || '',
          address: field.address || '',
          field_type: field.field_type || 'Sân 5 người',
          price_per_hour: field.price_per_hour || 0,
          description: field.description || '',
          amenities: field.amenities || [],
          images: field.images || [],
          status: field.status || 'active'
        });
      } catch (err) {
        console.error('Error fetching field:', err);
        setError('Không thể tải thông tin sân bóng.');
      } finally {
        setLoading(false);
      }
    };
    fetchField();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price_per_hour' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleAddImage = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await fieldService.updateField(id, formData);
      navigate('/owner/fields');
    } catch (err) {
      console.error('Error updating field:', err);
      setError('Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/owner/fields')}
          className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Quay lại danh sách</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa sân bóng</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-r-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info & Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Info size={20} />
              <h2 className="font-bold">Thông tin cơ bản</h2>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Activity size={16} className={formData.status === 'active' ? 'text-green-500' : 'text-red-500'} />
              <span className="text-sm font-semibold text-gray-600 mr-2">Trạng thái:</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600">Tên sân bóng</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="field_name"
                  value={formData.field_name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600">Loại sân</label>
              <select
                name="field_type"
                value={formData.field_type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              >
                <option value="Sân 5 người">Sân 5 người</option>
                <option value="Sân 7 người">Sân 7 người</option>
                <option value="Sân 11 người">Sân 11 người</option>
              </select>
            </div>

            <div className="col-span-full space-y-1">
              <label className="text-sm font-semibold text-gray-600">Địa chỉ</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600">Giá thuê (VND/giờ)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  name="price_per_hour"
                  value={formData.price_per_hour}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-600 border-b border-gray-50 pb-3 mb-2">
            <ImageIcon size={20} />
            <h2 className="font-bold">Ảnh sân bóng</h2>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
              placeholder="Dán link ảnh tại đây..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Thêm ảnh
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {formData.images.map((url, idx) => (
              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-100 shadow-sm">
                <img src={url} alt={`Pitch ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Description & Amenities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 border-b border-gray-50 pb-3 mb-2">
              <Info size={20} />
              <h2 className="font-bold">Mô tả chi tiết</h2>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 border-b border-gray-50 pb-3 mb-2">
              <CheckSquare size={20} />
              <h2 className="font-bold">Tiện ích</h2>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                placeholder="Wifi, Gửi xe..."
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
              >
                <Plus size={24} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.amenities.map((item, idx) => (
                <span key={idx} className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {item}
                  <button onClick={() => handleRemoveAmenity(idx)} className="ml-2 hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/owner/fields')}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
          >
            Hủy thay đổi
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{saving ? 'Đang lưu...' : 'Lưu cập nhật'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditField;
