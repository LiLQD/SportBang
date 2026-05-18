import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Loader2, AlertCircle, User, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { bookingService } from '../services/api';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null); // stores booking ID being processed

  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchBookings();
  }, [role]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let response;
      if (role === 'admin') {
        // We might need to add this to api.js first
        response = await bookingService.getAllBookings();
      } else {
        response = await bookingService.getOwnerBookings();
      }
      setBookings(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      const response = await bookingService.updateStatus(id, status);
      if (response.data.success) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: status } : b));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.field?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-grow p-8 text-black overflow-hidden flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-indigo-900">Manage Bookings</h1>
          <p className="text-gray-500">View and manage court reservations</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-grow">
          {/* Filters Bar */}
          <div className="p-4 border-b flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
            <div className="relative w-full max-w-sm">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Search by Customer, Pitch, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">Status:</label>
              <select
                className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={fetchBookings}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                title="Refresh"
              >
                <Clock size={20} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto flex-grow">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
                <p className="text-gray-500">Fetching reservations...</p>
              </div>
            ) : error ? (
              <div className="m-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center">
                <AlertCircle className="mr-2" size={20} />
                {error}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <CalendarIcon size={48} className="mb-4 opacity-20" />
                <p>No bookings found matching your criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs font-bold sticky top-0 border-b">
                  <tr>
                    <th className="px-6 py-4">Booking Info</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Pitch</th>
                    <th className="px-6 py-4">Time Slot</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-400">#{booking._id.slice(-6).toUpperCase()}</span>
                        <div className="text-xs text-gray-500 mt-1">{new Date(booking.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold mr-3">
                            {booking.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{booking.user?.name}</div>
                            <div className="text-xs text-gray-500">{booking.user?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          <span className="font-medium">{booking.field?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{new Date(booking.date).toLocaleDateString()}</div>
                        <div className="text-xs text-indigo-600 bg-indigo-50 inline-block px-1 rounded mt-1">
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ${booking.totalPrice}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {actionLoading === booking._id ? (
                          <Loader2 className="animate-spin text-indigo-600 ml-auto" size={20} />
                        ) : booking.status === 'pending' ? (
                          <div className="flex justify-end space-x-1">
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Confirm Booking"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Cancel Booking"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        ) : (
                          <button className="text-indigo-600 hover:underline text-xs font-bold">Details</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredBookings.length} results</span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded hover:bg-white transition disabled:opacity-30" disabled>Previous</button>
              <button className="px-3 py-1 border rounded hover:bg-white transition disabled:opacity-30" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
