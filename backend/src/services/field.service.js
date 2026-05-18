const Field = require('../models/Field');
const mongoose = require('mongoose');

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
  const filter = { isDeleted: false, status: { $ne: 'deleted' } };
  
  // Khách hàng chỉ thấy các sân đang hoạt động
  if (!user || user.role === 'customer') {
    filter.status = 'active';
  }
  
  // Tìm kiếm theo tên (không phân biệt hoa thường)
  if (query.search) {
    filter.field_name = { $regex: query.search, $options: 'i' };
  }
  
  // Lọc theo loại môn thể thao (Bóng đá, Cầu lông,...)
  if (query.sport_type && query.sport_type !== 'Tất cả') {
    filter.sport_type = query.sport_type;
  }

  // Lọc theo chủ sân (nếu cần)
  if (query.owner_id) {
    filter.owner_id = query.owner_id;
  }

  return await Field.find(filter)
    .populate('owner_id', 'full_name email phone')
    .sort({ createdAt: -1 });
};

const getFieldsByOwner = async (ownerId) => {
  try {
    const idStr = ownerId.toString();
    const queryId = new mongoose.Types.ObjectId(idStr);

    console.log(`[Service] Đang tìm sân cho ID: ${queryId}`);

    // Truy vấn linh hoạt: Lấy mọi sân của chủ sở hữu này trừ những sân đã xóa
    const fields = await Field.find({
      owner_id: queryId,
      isDeleted: false,
      status: { $ne: 'deleted' }
    }).sort({ createdAt: -1 });

    console.log(`[Service] Kết quả: Tìm thấy ${fields.length} sân trong cơ sở dữ liệu.`);
    return fields;
  } catch (error) {
    console.error("[Service] Lỗi khi truy vấn danh sách sân:", error);
    return [];
  }
};

const getFieldById = async (id, user) => {
  const field = await Field.findById(id).populate('owner_id', 'full_name email phone');
  if (!field || field.isDeleted || field.status === 'deleted') {
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

  // Đảm bảo owner_id được lưu dưới dạng ObjectId chuẩn
  const finalOwnerId = new mongoose.Types.ObjectId(ownerId.toString());

  return await Field.create({
    ...payload,
    owner_id: finalOwnerId
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
  
  const oldStatus = field.status;
  field.status = status;
  const savedField = await field.save();

  // Create notifications for users who have upcoming bookings at this field if status becomes maintenance or inactive
  if (status === 'maintenance' || status === 'inactive' || status === 'deleted') {
    const Booking = require('../models/Booking');
    const upcomingBookings = await Booking.find({
      field_id: fieldId,
      booking_date: { $gte: new Date().setUTCHours(0,0,0,0) },
      status: { $in: ['pending', 'confirmed'] }
    }).populate('user_id');

    const Notification = require('../models/Notification');
    const statusText = status === 'maintenance' ? 'đang bảo trì' : (status === 'deleted' ? 'đã bị xóa' : 'tạm ngưng hoạt động');

    for (const booking of upcomingBookings) {
      await Notification.create({
        user_id: booking.user_id._id,
        title: 'Thông báo về sân đặt của bạn',
        message: `Sân "${field.field_name}" mà bạn đã đặt vào ngày ${booking.booking_date.toLocaleDateString('vi-VN')} hiện ${statusText}. Vui lòng liên hệ chủ sân để biết thêm chi tiết.`,
        type: 'system',
        data: { field_id: fieldId, booking_id: booking._id }
      });
    }
  }

  return savedField;
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
  field.status = 'deleted';
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
  getFieldsByOwner,
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
