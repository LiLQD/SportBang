import React, { useState, useEffect } from 'react';
import { fieldService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MapPin,
  Clock,
  Edit3,
  Trash2,
  Loader2,
  Tag
} from 'lucide-react';

const OwnerFields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMyFields = async () => {
    try {
      setLoading(true);
      const res = await fieldService.getMyFields();
      setFields(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching my fields:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sân bóng này? Toàn bộ dữ liệu khung giờ liên quan cũng sẽ bị xóa.')) {
      return;
    }

    try {
      await fieldService.deleteField(id);
      fetchMyFields(); // Refresh list
    } catch (error) {
      alert('Không thể xóa sân bóng này. Có thể sân đang có lịch đặt.');
    }
  };

  useEffect(() => {
    fetchMyFields();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sân bóng của tôi</h1>
          <p className="text-gray-500 text-sm">Quản lý danh sách và thông tin chi tiết các sân bóng của bạn</p>
        </div>
        <button
          onClick={() => navigate('/owner/fields/add')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          <span>Thêm sân mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {fields.map((field) => (
          <div key={field._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="relative h-52 overflow-hidden">
              <img
                src={field.images?.[0] || 'https://via.placeholder.com/400x300'}
                alt={field.field_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  field.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                } backdrop-blur-sm`}>
                  {field.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-xl text-gray-800 line-clamp-1">{field.field_name}</h3>
                <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                  {field.field_type}
                </span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start text-sm text-gray-500">
                  <MapPin size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span className="line-clamp-2">{field.address}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Tag size={16} className="mr-2 text-gray-400" />
                  <span className="font-bold text-indigo-600">{(field.price_per_hour || 0).toLocaleString()}đ</span>
                  <span className="ml-1">/ giờ</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => navigate(`/owner/fields/edit/${field._id}`)}
                  className="flex items-center justify-center space-x-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-medium transition-colors"
                >
                  <Edit3 size={18} />
                  <span>Sửa sân</span>
                </button>
                <button
                  onClick={() => handleDelete(field._id)}
                  className="flex items-center justify-center space-x-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-medium transition-colors"
                >
                  <Trash2 size={18} />
                  <span>Xóa</span>
                </button>
              </div>
              <button
                onClick={() => navigate(`/owner/fields/${field._id}/slots`)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold transition-colors"
              >
                <Clock size={18} />
                <span>Quản lý khung giờ</span>
              </button>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-center">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-gray-500 font-bold text-lg">Bạn chưa có sân bóng nào</h3>
            <p className="text-gray-400 text-sm mt-1">Hãy bắt đầu kinh doanh bằng cách thêm sân bóng đầu tiên của mình!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerFields;
