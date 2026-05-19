import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fieldService } from '../../services/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Loader2,
  AlertCircle,
  Save,
  X,
  Edit2
} from 'lucide-react';

const FieldSlots = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  const [formData, setFormData] = useState({
    start_time: '06:00',
    end_time: '07:00',
    price: 0,
    status: 'available'
  });

  const fetchFieldData = async () => {
    try {
      setLoading(true);
      const res = await fieldService.getFieldById(id);
      setField(res.data.data || res.data);
      if (res.data.data?.price_per_hour) {
        setFormData(prev => ({ ...prev, price: res.data.data.price_per_hour }));
      }
    } catch (err) {
      console.error('Error fetching field slots:', err);
      setError('Không thể tải thông tin khung giờ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFieldData();
  }, [id]);

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setFormData({
      start_time: '06:00',
      end_time: '07:00',
      price: field?.price_per_hour || 0,
      status: 'available'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      start_time: slot.start_time,
      end_time: slot.end_time,
      price: slot.price,
      status: slot.status
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingSlot) {
        await fieldService.updateSlot(id, editingSlot._id, formData);
      } else {
        await fieldService.addSlot(id, formData);
      }
      setShowAddModal(false);
      fetchFieldData();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) return;

    setActionLoading(true);
    try {
      await fieldService.deleteSlot(id, slotId);
      fetchFieldData();
    } catch (err) {
      alert('Không thể xóa khung giờ này.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/owner/fields')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý khung giờ</h1>
            <p className="text-gray-500 font-medium">{field?.field_name}</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          <span>Thêm khung giờ</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center rounded-r-lg">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {field?.slots?.map((slot) => (
          <div key={slot._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Clock size={24} />
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(slot)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(slot._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-bold text-gray-800">
                {slot.start_time} - {slot.end_time}
              </div>
              <div className="flex items-center text-indigo-600 font-bold">
                <DollarSign size={16} />
                <span>{(slot.price || 0).toLocaleString()}đ</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                slot.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {slot.status === 'available' ? 'Sẵn sàng' : 'Đang bảo trì'}
              </span>
              {slot.is_booked && (
                <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2.5 py-1 rounded-full">
                  Đã được đặt
                </span>
              )}
            </div>
          </div>
        ))}

        {(!field?.slots || field.slots.length === 0) && (
          <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-center">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-gray-500 font-bold text-lg">Chưa có khung giờ nào</h3>
            <p className="text-gray-400 text-sm mt-1">Hãy bắt đầu bằng cách thêm các khung giờ hoạt động cho sân bóng này</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
              <h2 className="text-xl font-bold">
                {editingSlot ? 'Cập nhật khung giờ' : 'Thêm khung giờ mới'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-indigo-500 p-1 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Giờ kết thúc</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600">Giá khung giờ (VND)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="available">Sẵn sàng</option>
                  <option value="unavailable">Tạm dừng (Bảo trì)</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>{editingSlot ? 'Cập nhật' : 'Lưu lại'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSlots;
