import React, { useState, useEffect } from 'react';
import { adminService, bookingService } from '../../services/api';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  FileText,
  ChevronDown,
  Trash2
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);

  // Stats summary
  const [stats, setStats] = useState({
    total: 0,
    revenue: 0,
    pending: 0,
    completed: 0
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllBookings();
      const data = res.data.data || res.data;
      setBookings(data);

      // Calculate stats
      const summary = data.reduce((acc, curr) => {
        acc.total++;
        if (curr.status === 'completed' || curr.status === 'confirmed') acc.revenue += (curr.total_price || 0);
        if (curr.status === 'pending') acc.pending++;
        if (curr.status === 'completed') acc.completed++;
        return acc;
      }, { total: 0, revenue: 0, pending: 0, completed: 0 });

      setStats(summary);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      fetchBookings();
      setActiveMenu(null);
    } catch (error) {
      alert("Cập nhật trạng thái thất bại");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.user_id?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.field_id?.field_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý giao dịch</h1>
          <p className="text-gray-500 text-sm">Theo dõi toàn bộ lịch đặt sân và doanh thu hệ thống</p>
        </div>
        <div className="flex items-center space-x-2">
           <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all font-medium">
             <FileText size={18} />
             <span>Xuất báo cáo</span>
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng số đơn" value={stats.total} icon={<Calendar className="text-indigo-600"/>} bg="bg-indigo-50" />
        <StatCard title="Doanh thu" value={`${stats.revenue.toLocaleString()}đ`} icon={<DollarSign className="text-emerald-600"/>} bg="bg-emerald-50" />
        <StatCard title="Đang chờ" value={stats.pending} icon={<Clock className="text-amber-600"/>} bg="bg-amber-50" />
        <StatCard title="Hoàn thành" value={stats.completed} icon={<CheckCircle2 className="text-blue-600"/>} bg="bg-blue-50" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên khách, tên sân..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600 font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Sân bóng</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Giá tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-xs font-mono font-bold text-gray-400">#{booking._id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">
                        {booking.user_id?.full_name?.charAt(0) || 'K'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{booking.user_id?.full_name || 'N/A'}</p>
                        <p className="text-[10px] text-gray-400">{booking.user_id?.phone || 'Chưa có SĐT'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-medium text-gray-700 text-sm">{booking.field_id?.field_name || 'Sân đã xóa'}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{booking.field_id?.field_type}</p>
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <div className="flex items-center text-gray-700 font-medium">
                      <Calendar size={14} className="mr-1.5 text-indigo-500" />
                      {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center text-gray-400 text-xs mt-0.5">
                      <Clock size={14} className="mr-1.5" />
                      {booking.booking_slot?.start} - {booking.booking_slot?.end}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-indigo-600">{(booking.total_price || 0).toLocaleString()}đ</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight ${getStatusBadge(booking.status)}`}>
                      {booking.status === 'pending' ? 'Chờ duyệt' :
                       booking.status === 'confirmed' ? 'Đã duyệt' :
                       booking.status === 'completed' ? 'Xong' : 'Hủy'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === booking._id ? null : booking._id);
                        }}
                        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${activeMenu === booking._id ? 'bg-gray-100 text-indigo-600' : 'text-gray-400'}`}
                      >
                        <ChevronDown size={18} className={`transition-transform duration-200 ${activeMenu === booking._id ? 'rotate-180' : ''}`} />
                      </button>

                      {activeMenu === booking._id && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-1">
                          <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quản trị đơn hàng</div>

                          {booking.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(booking._id, 'confirmed');
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center space-x-2"
                            >
                              <CheckCircle2 size={16} />
                              <span>Phê duyệt đơn</span>
                            </button>
                          )}

                          {booking.status === 'confirmed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(booking._id, 'completed');
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                            >
                              <CheckCircle2 size={16} />
                              <span>Hoàn thành đơn</span>
                            </button>
                          )}

                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(booking._id, 'cancelled');
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <XCircle size={16} />
                              <span>Hủy đơn này</span>
                            </button>
                          )}

                          <div className="h-px bg-gray-100 my-1"></div>

                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <FileText size={16} />
                            <span>Chi tiết hóa đơn</span>
                          </button>

                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Trash2 size={16} />
                            <span>Xóa lịch sử</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">Không tìm thấy đơn đặt sân nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg }) => (
  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
    <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-xl font-black text-gray-800">{value}</h3>
    </div>
  </div>
);

export default AdminBookings;
