import React, { useState, useEffect } from 'react';
import { ownerService } from '../../services/api';
import {
  Activity,
  MapPin,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  Loader2,
  Clock,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    active_fields: 0,
    today_bookings: 0,
    today_revenue: 0,
    pending_bookings: 0,
    total_fields: 0,
    total_bookings: 0,
    total_revenue: 0,
    monthly_revenue: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await ownerService.getDashboard();
        setStats(res.data.data || res.data);
      } catch (error) {
        console.error("Error fetching owner stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = stats.monthly_revenue?.map(item => ({
    name: `T${item.month}`,
    revenue: item.revenue
  })) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  const cards = [
    { title: 'Sân hoạt động', value: stats.active_fields, icon: <MapPin />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Đơn hôm nay', value: stats.today_bookings, icon: <CalendarCheck />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Chờ duyệt', value: stats.pending_bookings, icon: <Clock />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Doanh thu ngày', value: `${(stats.today_revenue || 0).toLocaleString()}đ`, icon: <CreditCard />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển Chủ sân</h1>
          <p className="text-gray-500 text-sm">Chào mừng bạn trở lại, đây là hiệu suất sân bóng của bạn.</p>
        </div>
        <button
          onClick={() => navigate('/owner/fields')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          <span className="font-medium">Thêm sân mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:translate-y-[-4px]">
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center mb-4`}>
              {card.icon}
            </div>
            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-gray-800 text-lg">Biểu đồ doanh thu</h2>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl">
           <div>
              <p className="text-indigo-300 text-sm font-medium">Tổng doanh thu hệ thống</p>
              <h2 className="text-4xl font-bold mt-2">{(stats.total_revenue || 0).toLocaleString()}đ</h2>
              <div className="mt-4 flex items-center text-emerald-400 text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>+12.5% so với tháng trước</span>
              </div>
           </div>

           <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-300">Tổng số lượt đặt</span>
                <span className="font-bold">{stats.total_bookings}</span>
              </div>
              <div className="w-full bg-indigo-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[75%]" />
              </div>
              <p className="text-xs text-indigo-400 italic">* Dữ liệu được tính từ khi bạn gia nhập SportBang</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
