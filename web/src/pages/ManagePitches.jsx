import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { fieldService, adminService } from '../services/api';
import Sidebar from '../components/Sidebar';
import PitchModal from '../components/PitchModal';

const ManagePitches = () => {
  const role = localStorage.getItem('role');
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPitch, setCurrentPitch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPitches();
  }, [role]);

  const fetchPitches = async () => {
    try {
      setLoading(true);
      let response;
      if (role === 'admin') {
        response = await fieldService.getAllFields();
      } else {
        response = await fieldService.getMyFields();
      }
      setPitches(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching pitches:', err);
      setError('Failed to load pitches. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentPitch(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pitch) => {
    setCurrentPitch(pitch);
    setIsModalOpen(true);
  };

  const handleSavePitch = async (formData) => {
    try {
      setActionLoading(true);
      if (currentPitch) {
        // Update
        const response = await fieldService.updateField(currentPitch._id, formData);
        if (response.data.success) {
          setPitches(prev => prev.map(p => p._id === currentPitch._id ? response.data.data : p));
        }
      } else {
        // Create
        const response = await fieldService.createField(formData);
        if (response.data.success) {
          setPitches(prev => [...prev, response.data.data]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save pitch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (pitchId, currentStatus) => {
    try {
      setActionLoading(true);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminService.updateFieldStatus(pitchId, newStatus);
      setPitches(prev => prev.map(p => p._id === pitchId ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update pitch status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pitch?')) {
      try {
        await fieldService.deleteField(id);
        setPitches(pitches.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete pitch');
      }
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-grow p-8 text-black overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-900">
            {role === 'admin' ? 'System Management: Pitches' : 'Manage My Pitches'}
          </h1>
          {role === 'owner' && (
            <button
              onClick={handleOpenAddModal}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Pitch
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-indigo-600 mb-2" size={40} />
            <p className="text-gray-500">Loading your pitches...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        ) : pitches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">You haven't added any pitches yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 text-indigo-600 font-semibold hover:underline"
            >
              Create your first pitch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitches.map((pitch) => (
              <div key={pitch._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition group">
                <div className="h-40 bg-indigo-50 flex items-center justify-center border-b border-gray-100 overflow-hidden relative">
                   {pitch.images && pitch.images.length > 0 ? (
                     <img src={pitch.images[0]} alt={pitch.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                   ) : (
                     <MapPin size={48} className="text-indigo-200" />
                   )}
                   <div className="absolute top-2 right-2">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${pitch.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                       {pitch.status || 'Active'}
                     </span>
                   </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 truncate pr-2">{pitch.name}</h3>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-medium whitespace-nowrap">{pitch.type}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{pitch.address || 'No address provided'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="font-bold text-indigo-600 text-lg">${pitch.price}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
                    <div className="flex space-x-1">
                      {role === 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(pitch._id, pitch.status || 'active')}
                          className={`p-2 rounded-full transition ${
                            (pitch.status === 'active' || !pitch.status)
                              ? 'text-yellow-500 hover:bg-yellow-50'
                              : 'text-green-500 hover:bg-green-50'
                          }`}
                          title={(pitch.status === 'active' || !pitch.status) ? 'Deactivate' : 'Activate'}
                        >
                          {(pitch.status === 'active' || !pitch.status) ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(pitch)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pitch._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pitch Form Modal */}
        <PitchModal
          isOpen={isModalOpen}
          onClose={() => !actionLoading && setIsModalOpen(false)}
          onSave={handleSavePitch}
          pitch={currentPitch}
        />

        {actionLoading && (
          <div className="fixed inset-0 bg-black/20 z-[60] flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
              <Loader2 className="animate-spin text-indigo-600" />
              <span className="font-medium">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePitches;
