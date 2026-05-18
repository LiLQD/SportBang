import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, MapPin, Users as UsersIcon, LogOut, Bell } from 'lucide-react';
import { notificationService } from '../services/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications();
        const unread = res.data.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const commonItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: (
        <div className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center border-2 border-indigo-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      )
    },
  ];

  const adminItems = [
    { name: 'User Management', path: '/users', icon: <UsersIcon size={20} /> },
    { name: 'System Pitches', path: '/pitches', icon: <MapPin size={20} /> },
    { name: 'All Bookings', path: '/bookings', icon: <Calendar size={20} /> },
  ];

  const ownerItems = [
    { name: 'My Pitches', path: '/pitches', icon: <MapPin size={20} /> },
    { name: 'Pitch Reservations', path: '/bookings', icon: <Calendar size={20} /> },
  ];

  const menuItems = role === 'admin'
    ? [commonItems[0], ...adminItems, commonItems[1]]
    : [commonItems[0], ...ownerItems, commonItems[1]];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 text-2xl font-bold border-b border-indigo-800 flex items-center">
        <span className="text-white">Sport</span>
        <span className="text-indigo-400">Bang</span>
      </div>
      <nav className="flex-grow p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center w-full p-3 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-indigo-700 text-white shadow-inner'
                : 'hover:bg-indigo-800 text-indigo-100 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-indigo-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
