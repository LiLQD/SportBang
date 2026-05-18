import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Loader2, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      // Xử lý dữ liệu linh hoạt cho cả 2 cấu trúc response phổ biến
      const responseData = response.data.data || response.data;
      const { user, token } = responseData;

      if (!user || !token) {
        throw new Error('Dữ liệu phản hồi từ máy chủ không hợp lệ.');
      }

      // KIỂM TRA QUYỀN
      if (user.role !== 'admin' && user.role !== 'owner') {
        setError('Tài khoản này không có quyền truy cập trang quản trị.');
        setLoading(false);
        return;
      }

      // Lưu thông tin vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('user', JSON.stringify(user));

      // Điều hướng về trang chủ (Dashboard sẽ tự xử lý hiển thị theo role)
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Lock className="text-white" size={24} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            SportBang Web
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Cổng quản trị dành cho Admin & Chủ sân
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Email quản trị"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center text-red-700 text-sm">
              <AlertCircle className="mr-2 flex-shrink-0" size={16} />
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:bg-indigo-400"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-400 mt-4">
          Hệ thống quản lý sân thể thao SportBang v2.0
        </div>
      </div>
    </div>
  );
};

export default Login;
