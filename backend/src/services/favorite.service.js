const User = require('../models/User');
const Field = require('../models/Field');

const toggleFavorite = async (userId, fieldId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const field = await Field.findById(fieldId);
  if (!field) throw new Error('Field not found');

  const index = user.favorites.indexOf(fieldId);
  if (index === -1) {
    user.favorites.push(fieldId);
  } else {
    user.favorites.splice(index, 1);
  }

  await user.save();
  return user.favorites;
};

const getFavorites = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'favorites',
    match: { isDeleted: false }
  });
  if (!user) throw new Error('User not found');
  return user.favorites;
};

module.exports = {
  toggleFavorite,
  getFavorites
};
