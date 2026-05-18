import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

const PitchModal = ({ isOpen, onClose, onSave, pitch = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '5x5',
    address: '',
    price: '',
    description: '',
    images: []
  });

  useEffect(() => {
    if (pitch) {
      setFormData({
        name: pitch.name || '',
        type: pitch.type || '5x5',
        address: pitch.address || '',
        price: pitch.price || '',
        description: pitch.description || '',
        images: pitch.images || []
      });
    } else {
      setFormData({
        name: '',
        type: '5x5',
        address: '',
        price: '',
        description: '',
        images: []
      });
    }
  }, [pitch, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{pitch ? 'Edit Pitch' : 'Add New Pitch'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Stadium Alpha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Type</label>
              <select
                name="type"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="5x5">5 vs 5</option>
                <option value="7x7">7 vs 7</option>
                <option value="11x11">11 vs 11</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location</label>
            <input
              type="text"
              name="address"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address of the facility"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour ($)</label>
            <input
              type="number"
              name="price"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
              value={formData.description}
              onChange={handleChange}
              placeholder="Details about the pitch, amenities, etc."
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Temporary)</label>
             <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                  placeholder="Paste image URL here"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (e.target.value) {
                        setFormData(prev => ({ ...prev, images: [...prev.images, e.target.value] }));
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="bg-gray-100 p-2 rounded-lg text-gray-600 hover:bg-gray-200"
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling;
                    if (input.value) {
                      setFormData(prev => ({ ...prev, images: [...prev.images, input.value] }));
                      input.value = '';
                    }
                  }}
                >
                  <Plus size={20} />
                </button>
             </div>
             <div className="mt-2 flex flex-wrap gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </form>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
          >
            {pitch ? 'Update Pitch' : 'Save Pitch'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitchModal;
