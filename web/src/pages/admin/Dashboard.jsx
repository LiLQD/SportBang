import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_bookings: 0,
    total_revenue: 0,
    total_users: 0,
    total_fields: 0,
    monthly_revenue: [],
    top_fields: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboard();
        // Backend trả về { success: true, data: { ... } }
        const data = res.data.data || res.data;
        setStats(data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = stats.monthly_revenue?.map(item => ({
    name: `Tháng ${item.month}`,
    revenue: item.revenue / 1000000 // Chuyển sang triệu
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  const kpis = [
    { title: 'Tổng Đơn', value: stats.total_bookings, icon: <Calendar size={24}/>, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { title: 'Doanh Thu', value: `${((stats.total_revenue || 0) / 1000000).toFixed(1)}M`, icon: <DollarSign size={24}/>, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
    { title: 'Người dùng', value: stats.total_users, icon: <Users size={24}/>, color: 'bg-amber-500', textColor: 'text-amber-600' },
    { title: 'Tổng Sân', value: stats.total_fields, icon: <MapPin size={24}/>, color: 'bg-purple-500', textColor: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Hệ thống Quản trị (Admin)</h1>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          Cập nhật: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`${kpi.color} p-4 rounded-xl text-white shadow-lg shadow-gray-200`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Doanh thu hệ thống (Triệu VNĐ)</h2>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} Triệu`, 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Fields */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Top sân hiệu quả</h2>
          <div className="space-y-4">
            {stats.top_fields?.length > 0 ? (
              stats.top_fields.map((field, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{field.field_name}</p>
                      <p className="text-xs text-gray-500">{field.count} đơn đặt</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{(field.revenue || 0).toLocaleString()}đ</p>
                    <ArrowUpRight size={14} className="inline text-green-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
