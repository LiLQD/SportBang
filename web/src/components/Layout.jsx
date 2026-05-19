import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, role }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Nội dung chính bên phải */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
