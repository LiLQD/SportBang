import React, { useState, useEffect } from 'react';
import { fieldService, adminService } from '../../services/api';
import {
  Search,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Eye,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const AdminFields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, active, inactive
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFields = async () => {
    try {
      setLoading(true);
      const res = await fieldService.getAllFields();
      setFields(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching fields:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const confirmMsg = status === 'active'
      ? "Phê duyệt sân bóng này hoạt động?"
      : "Bạn có chắc chắn muốn khóa/từ chối sân bóng này?";

    if (!window.confirm(confirmMsg)) return;

    try {
      // Gọi đúng hàm từ adminService trong api.js
      await adminService.updateFieldStatus(id, status);
      fetchFields();
    } catch (error) {
      alert("Cập nhật trạng thái thất bại");
    }
  };

  const filteredFields = fields.filter(field => {
    const matchSearch = field.field_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       field.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' || field.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý sân bóng</h1>
          <p className="text-gray-500 text-sm">Kiểm duyệt và quản lý toàn bộ sân bóng trên hệ thống</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tên sân, địa chỉ..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-600 font-medium"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                <th className="px-6 py-4">Sân bóng</th>
                <th className="px-6 py-4">Chủ sân</th>
                <th className="px-6 py-4">Thông tin</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFields.map((field) => (
                <tr key={field._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={field.images?.[0] || 'https://via.placeholder.com/100'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{field.field_name}</p>
                        <p className="text-xs text-gray-400 flex items-center mt-0.5">
                          <MapPin size={10} className="mr-1" /> {field.address?.split(',').slice(-2).join(',')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {field.owner_id?.full_name?.charAt(0) || 'O'}
                      </div>
                      <span className="font-medium text-gray-700">{field.owner_id?.full_name || 'Chưa cập nhật'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">
                        {field.field_type}
                      </span>
                      <p className="text-sm font-bold text-gray-800">{(field.price_per_hour || 0).toLocaleString()}đ<span className="text-gray-400 font-normal">/h</span></p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={field.status} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end space-x-2">
                      {field.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(field._id, 'active')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Phê duyệt"
                          >
                            <ShieldCheck size={20} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(field._id, 'inactive')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Từ chối"
                          >
                            <XCircle size={20} />
                          </button>
                        </>
                      )}
                      {field.status === 'active' && (
                        <button
                          onClick={() => handleUpdateStatus(field._id, 'inactive')}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Khóa sân"
                        >
                          <AlertTriangle size={20} />
                        </button>
                      )}
                      {field.status === 'inactive' && (
                        <button
                          onClick={() => handleUpdateStatus(field._id, 'active')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Mở khóa"
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFields.length === 0 && (
          <div className="text-center py-20">
            <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">Không tìm thấy sân bóng nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    inactive: 'bg-red-100 text-red-700 border-red-200',
  };
  const labels = {
    active: 'Hoạt động',
    pending: 'Chờ duyệt',
    inactive: 'Đã khóa',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[status] || styles.inactive}`}>
      {labels[status] || status}
    </span>
  );
};

export default AdminFields;
