import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import {
  Search,
  UserPlus,
  MoreVertical,
  Shield,
  Trash2,
  Lock,
  Unlock,
  Loader2,
  Mail,
  Phone,
  Filter,
  X,
  User,
  Save,
  AlertCircle,
  Check
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      setUsers(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user) => {
    const action = user.status === 'active' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản ${user.full_name}?`)) return;

    try {
      setActionLoading(true);
      await adminService.toggleUserBlock(user._id);
      fetchUsers();
    } catch (error) {
      alert("Không thể thực hiện hành động này");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) return;

    try {
      setActionLoading(true);
      await adminService.deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert("Xóa người dùng thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await adminService.createUser(formData);
      setShowAddModal(false);
      setFormData({ full_name: '', email: '', phone: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Thêm người dùng thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
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
          <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm">Quản lý thông tin, vai trò và trạng thái tài khoản hệ thống</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-100 font-bold"
        >
          <UserPlus size={20} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm tên, email, số điện thoại..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600 font-medium"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Người dùng (User)</option>
              <option value="owner">Chủ sân (Owner)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">ID: {user._id.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone size={14} className="mr-2 text-gray-400" />
                        {user.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-xs font-bold ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleBlock(user)}
                        disabled={actionLoading}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'active' ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'
                        }`}
                        title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                      >
                        {user.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={actionLoading || user.role === 'admin'}
                        className={`p-2 rounded-lg transition-colors ${user.role === 'admin' ? 'opacity-20 cursor-not-allowed' : 'hover:bg-red-50 text-red-500'}`}
                        title="Xóa người dùng"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-20 bg-gray-50/20">
            <User size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
              <h2 className="text-xl font-bold">Thêm người dùng mới</h2>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-indigo-500 p-1 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="0123456789"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600">Mật khẩu</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600">Vai trò</label>
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">Người dùng (User)</option>
                  <option value="owner">Chủ sân (Owner)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>Lưu người dùng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    owner: 'bg-blue-100 text-blue-700 border-blue-200',
    user: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const labels = {
    admin: 'Quản trị viên',
    owner: 'Chủ sân',
    user: 'Người dùng',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[role] || styles.user}`}>
      {role === 'admin' && <Shield size={12} className="mr-1" />}
      {labels[role] || role}
    </span>
  );
};

export default AdminUsers;
