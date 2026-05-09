const Field = require('../models/Field');

const timeToMinutes = (time) => {
  if (!time || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const validateSlots = (slots) => {
  for (let i = 0; i < slots.length; i++) {
    const s1 = timeToMinutes(slots[i].start);
    const e1 = timeToMinutes(slots[i].end);
    
    if (s1 >= e1) {
      throw new Error(`Invalid time range: ${slots[i].start} - ${slots[i].end}`);
    }
    
    for (let j = i + 1; j < slots.length; j++) {
      const s2 = timeToMinutes(slots[j].start);
      const e2 = timeToMinutes(slots[j].end);
      
      if (s1 < e2 && s2 < e1) {
        throw new Error(`Time slots overlap: [${slots[i].start}-${slots[i].end}] and [${slots[j].start}-${slots[j].end}]`);
      }
    }
  }
};

const getAllFields = async (query, user) => {
  const filter = { isDeleted: false };
  
  // Customers should not see inactive fields
  if (!user || user.role === 'customer') {
    filter.status = 'active';
  }
  
  // Optional search by name
  if (query.field_name) {
    filter.field_name = { $regex: query.field_name, $options: 'i' };
  }
  
  // Optional filter by owner
  if (query.owner_id) {
    filter.owner_id = query.owner_id;
  }

  return await Field.find(filter).populate('owner_id', 'full_name email phone');
};

const getFieldById = async (id, user) => {
  const field = await Field.findById(id).populate('owner_id', 'full_name email phone');
  if (!field || field.isDeleted) {
    throw new Error('Field not found');
  }
  
  if ((!user || user.role === 'customer') && field.status !== 'active') {
    throw new Error('Field is not available');
  }
  
  return field;
};

const createField = async (payload, ownerId) => {
  if (payload.available_time) {
    validateSlots(payload.available_time);
  }
  
  return await Field.create({
    ...payload,
    owner_id: ownerId
  });
};

const updateField = async (fieldId, payload, user) => {
  const field = await Field.findById(fieldId);
  if (!field || field.isDeleted) {
    throw new Error('Field not found');
  }
  
  // Owner can only manage their own fields, Admin can manage all
  if (user.role !== 'admin' && field.owner_id.toString() !== user.id.toString()) {
    throw new Error('Not authorized to update this field');
  }
  
  if (payload.available_time) {
    validateSlots(payload.available_time);
  }
  
  return await Field.findByIdAndUpdate(fieldId, payload, { new: true });
};

const updateFieldStatus = async (fieldId, status, user) => {
  const field = await Field.findById(fieldId);
  if (!field || field.isDeleted) {
    throw new Error('Field not found');
  }
  
  if (user.role !== 'admin' && field.owner_id.toString() !== user.id.toString()) {
    throw new Error('Not authorized to update this field status');
  }
  
  field.status = status;
  return await field.save();
};

const deleteField = async (fieldId, user) => {
  const field = await Field.findById(fieldId);
  if (!field || field.isDeleted) {
    throw new Error('Field not found');
  }

  if (user.role !== 'admin' && field.owner_id.toString() !== user.id.toString()) {
    throw new Error('Not authorized to delete this field');
  }

  field.isDeleted = true;
  return await field.save();
};


const addSlot = async (fieldId, slotData, user) => {
  const field = await Field.findById(fieldId);
  if (!field || field.isDeleted) throw new Error('Field not found');

  if (user.role !== 'admin' && field.owner_id.toString() !== user.id.toString()) {
    throw new Error('Not authorized to manage slots for this field');
  }

  field.available_time.push(slotData);
  validateSlots(field.available_time);
  
  return await field.save();
};

const updateSlot = async (fieldId, slotId, slotData, user) => {
  const field = await Field.findById(fieldId);
  if (!field || field.isDeleted) throw new Error('Field not found');

  if (user.role !== 'admin' && field.owner_id.toString() !== user.id.toString()) {
    throw new Error('Not authorized to manage slots for this field');
  }

  const slot = field.available_time.id(slotId);
  if (!slot) throw new Error('Slot not found');

  if (slotData.start) slot.start = slotData.start;
  if (slotData.end) slot.end = slotData.end;

  validateSlots(field.available_time);
  
  return await field.save();
};

const deleteSlot = async (fieldId, slotId, user) => {
  const field = await Field.findById(fieldId);
  if (!field || field.isDeleted) throw new Error('Field not found');

  if (user.role !== 'admin' && field.owner_id.toString() !== user.id.toString()) {
    throw new Error('Not authorized to manage slots for this field');
  }

  field.available_time.pull(slotId);
  
  return await field.save();
};

const addImages = async (fieldId, files, user) => {
  const field = await Field.findById(fieldId);
  if (!field || field.isDeleted) throw new Error('Field not found');

  if (user.role !== 'admin' && field.owner_id.toString() !== user.id.toString()) {
    throw new Error('Not authorized to upload images for this field');
  }

  const imagePaths = files.map(file => `/uploads/${file.filename}`);
  field.images.push(...imagePaths);

  return await field.save();
};

const removeImage = async (fieldId, imagePath, user) => {
  const field = await Field.findById(fieldId);
  if (!field || field.isDeleted) throw new Error('Field not found');

  if (user.role !== 'admin' && field.owner_id.toString() !== user.id.toString()) {
    throw new Error('Not authorized to manage images for this field');
  }

  field.images = field.images.filter(img => img !== imagePath);

  return await field.save();
};

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  updateFieldStatus,
  deleteField,
  addSlot,
  updateSlot,
  deleteSlot,
  addImages,
  removeImage
};
