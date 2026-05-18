import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Shield, User, MoreVertical, Loader2, Mail, Calendar, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { adminService } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      // Giả định backend trả về { success: true, data: [...] }
      setUsers(response.data.data || response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminService.toggleUserBlock(userId);
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      setUsers(users.map(u => (u._id === userId || u.id === userId) ? { ...u, status: newStatus } : u));
    } catch (error) {
      console.error("Error updating user status:", error);
      alert(error.response?.data?.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter(u => (u._id !== userId && u.id !== userId)));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.full_name || user.name || '';
    const email = user.email || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-grow p-8 text-black">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500">Manage all accounts in the system</p>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition shadow-sm">
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2 outline-none"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                <p className="text-gray-500">Loading user database...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-4 border border-indigo-100">
                            {(user.full_name || user.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.full_name || user.name || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Mail size={12} className="mr-1" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'owner' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role === 'admin' ? <Shield size={12} className="mr-1" /> : <User size={12} className="mr-1" />}
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          (user.status === 'active' || !user.status) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${(user.status === 'active' || !user.status) ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1.5 text-gray-400" />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user._id || user.id, user.status || 'active')}
                            className={`p-2 rounded-lg transition-colors ${
                              (user.status === 'active' || !user.status)
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={(user.status === 'active' || !user.status) ? 'Suspend User' : 'Activate User'}
                          >
                            {(user.status === 'active' || !user.status) ? <XCircle size={18} /> : <CheckCircle size={18} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id || user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                        No users found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
