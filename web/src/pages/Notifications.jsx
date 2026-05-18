import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Clock, Loader2, AlertCircle, Info, Calendar as BookingIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { notificationService } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return <BookingIcon size={18} className="text-blue-500" />;
      case 'system': return <Info size={18} className="text-gray-500" />;
      default: return <Bell size={18} className="text-indigo-500" />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-grow p-8 text-black max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">Notifications</h1>
            <p className="text-gray-500">Stay updated with your business activity</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              <Check size={16} className="mr-1" />
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">All caught up!</h3>
            <p className="text-gray-500">You don't have any notifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white p-5 rounded-2xl shadow-sm border transition-all ${
                  notification.is_read ? 'border-gray-100 opacity-75' : 'border-indigo-100 bg-indigo-50/30 ring-1 ring-indigo-100'
                }`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-xl mr-4 ${
                    notification.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold ${notification.is_read ? 'text-gray-700' : 'text-indigo-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex mt-4 space-x-4">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-xs font-bold text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
