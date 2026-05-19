import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/api';
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null); // Quản lý menu dropdown

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getOwnerBookings();
      setBookings(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching owner bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchBookings();
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
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Lịch đặt sân khách hàng</h1>
        <p className="text-gray-500 text-sm">Quản lý và cập nhật trạng thái các đơn đặt sân bóng</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50/50">
            <tr className="text-xs uppercase text-gray-400 font-bold tracking-wider">
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Sân bóng</th>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4">Thanh toán</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {booking.user_id?.full_name?.charAt(0) || 'K'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{booking.user_id?.full_name || 'Khách'}</p>
                      <p className="text-xs text-gray-400 flex items-center"><Phone size={10} className="mr-1"/> {booking.user_id?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="font-medium text-gray-700">{booking.field_id?.field_name || 'Sân đã xóa'}</p>
                  <p className="text-xs text-gray-400 uppercase">{booking.field_id?.field_type}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar size={14} className="mr-2 text-indigo-500" />
                    {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock size={14} className="mr-2 text-gray-400" />
                    {booking.booking_slot?.start} - {booking.booking_slot?.end}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-gray-900">{(booking.total_price || 0).toLocaleString()}đ</p>
                  <p className="text-[10px] text-gray-400 uppercase">Thanh toán tiền mặt</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === booking._id ? null : booking._id);
                      }}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {activeMenu === booking._id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-1">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thao tác nhanh</div>

                        {booking.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(booking._id, 'confirmed');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center space-x-2"
                          >
                            <CheckCircle2 size={16} />
                            <span>Xác nhận đơn</span>
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
                            <span>Hoàn thành</span>
                          </button>
                        )}

                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(booking._id, 'cancelled');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <XCircle size={16} />
                            <span>Hủy đơn</span>
                          </button>
                        )}

                        <div className="h-px bg-gray-100 my-1"></div>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2">
                          <User size={16} />
                          <span>Xem khách hàng</span>
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

      {bookings.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <AlertCircle size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium">Bạn hiện không có đơn đặt sân nào</p>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
