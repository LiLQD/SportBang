import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, MapPin, DollarSign,
  TrendingUp, Users, Activity, ArrowUpRight, ArrowDownRight, Loader2, Clock
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Sidebar from '../components/Sidebar';
import { bookingService, fieldService, ownerService, adminService } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activePitches: 0,
    totalRevenue: 0,
    todayBookings: 0,
    todayRevenue: 0,
    pendingBookings: 0,
    growth: 12.5
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        let dashboardRes;
        let bookingsRes;

        if (role === 'admin') {
          // Admin specific dashboard data
          dashboardRes = await adminService.getDashboard();
          bookingsRes = await bookingService.getAllBookings();
        } else {
          // Owner specific dashboard data
          dashboardRes = await ownerService.getDashboard();
          bookingsRes = await bookingService.getOwnerBookings();
        }

        const data = dashboardRes.data.data || dashboardRes.data;

        setStats({
          totalBookings: data.total_bookings || 0,
          activePitches: data.total_fields || data.active_fields || 0,
          totalRevenue: data.total_revenue || 0,
          todayBookings: data.today_bookings || 0,
          todayRevenue: data.today_revenue || 0,
          pendingBookings: data.pending_bookings || 0,
          growth: role === 'admin' ? 12.5 : 8.4 // Giả lập tỷ lệ tăng trưởng
        });

        // Ánh xạ dữ liệu biểu đồ
        if (data.monthly_revenue) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const chartData = data.monthly_revenue.map(item => ({
            name: months[item.month - 1] || `Tháng ${item.month}`,
            revenue: item.revenue
          }));
          setRevenueData(chartData);
        }

        // Ánh xạ danh sách đặt sân gần đây
        const bookingsData = bookingsRes.data.data || bookingsRes.data;
        if (Array.isArray(bookingsData)) {
          const recent = bookingsData.slice(0, 5).map(b => ({
            id: b._id,
            customer: b.user_id?.full_name || b.user?.full_name || b.user?.name || 'Khách vãng lai',
            pitch: b.field_id?.field_name || b.field?.field_name || 'Sân đã xóa',
            date: new Date(b.booking_date || b.date).toLocaleDateString('vi-VN'),
            status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
            amount: b.total_price || b.totalPrice || 0
          }));
          setRecentBookings(recent);
        }

        setLoading(false);
      } catch (error) {
        console.error("Dashboard error:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [role]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="text-emerald-600" size={24} />,
      bgColor: 'bg-emerald-50',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <Calendar className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-50',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: <Activity className="text-yellow-600" size={24} />,
      bgColor: 'bg-yellow-50',
      trend: 'Awaiting',
      trendUp: null
    },
    {
      title: 'Active Pitches',
      value: stats.activePitches,
      icon: <MapPin className="text-orange-600" size={24} />,
      bgColor: 'bg-orange-50',
      trend: 'Stable',
      trendUp: null
    },
  ];

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-grow p-8 text-black overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex space-x-3">
            <div className="bg-white p-2 rounded-lg shadow-sm border text-sm font-medium flex items-center">
              <Calendar className="mr-2 text-indigo-600" size={16} />
              Last 30 Days
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                {stat.trendUp !== null ? (
                  <div className={`flex items-center mt-2 text-xs font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {stat.trend} <span className="text-gray-400 font-normal ml-1">vs last month</span>
                  </div>
                ) : (
                  <div className="mt-2 text-xs font-bold text-gray-400">
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Revenue Analytics</h2>
              <select className="bg-gray-50 border-none text-xs font-bold rounded-lg px-2 py-1 outline-none">
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    cursor={{stroke: '#4f46e5', strokeWidth: 2}}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Summary (Instead of Booking Trend since data is limited) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Daily Summary</h2>
              <Activity className="text-indigo-600" size={20} />
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-4">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Today's Revenue</p>
                    <p className="text-lg font-bold text-gray-900">${stats.todayRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-emerald-600 font-bold text-sm">+5.4%</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Today's Bookings</p>
                    <p className="text-lg font-bold text-gray-900">{stats.todayBookings}</p>
                  </div>
                </div>
                <div className="text-blue-600 font-bold text-sm">Active</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-4">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Actions</p>
                    <p className="text-lg font-bold text-gray-900">{stats.pendingBookings}</p>
                  </div>
                </div>
                <button className="text-indigo-600 text-xs font-bold hover:underline" onClick={() => navigate('/bookings')}>Review</button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Pitch</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mr-3">
                          {booking.customer.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{booking.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{booking.pitch}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{booking.date}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">${booking.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
