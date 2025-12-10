import { users } from '../config/mongoCollections.js';
import { getFacilityById } from './facilities.js';

const validateString = (str, fieldName) => {
  if (typeof str !== 'string' || str.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return str.trim();
};

const validateNumber = (num, fieldName, min = -Infinity, max = Infinity) => {
  const parsed = Number(num);
  if (isNaN(parsed) || parsed < min || parsed > max) {
    throw new Error(`${fieldName} must be a valid number between ${min} and ${max}`);
  }
  return parsed;
};

export const addFavorite = async (userId, facilityId) => {
  if (!userId) throw new Error('User ID must be provided');
  if (!facilityId) throw new Error('Facility ID must be provided');
  
  userId = validateString(userId, 'User ID').toLowerCase();
  const numFacilityId = validateNumber(facilityId, 'Facility ID');
  
  const userCollection = await users();
  const user = await userCollection.findOne({ userId: userId });
  if (!user) {
    throw new Error('User not found');
  }
  
  const facility = await getFacilityById(numFacilityId);
  
  const alreadyFavorited = user.favorites.some(fav => fav.facilityId === numFacilityId);
  if (alreadyFavorited) {
    throw new Error('This facility is already in your favorites');
  }
  
  const date = new Date();
  const favoriteDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  
  let facilityName;
  if (facility.parkName) {
    facilityName = facility.parkName;
  } else {
    facilityName = facility.recCenterName;
  }
  
  let facilityType;
  if (facility.park) {
    facilityType = 'park';
  } else {
    facilityType = 'rec_center';
  }
  
  const favorite = {
    facilityId: numFacilityId,
    facilityName: facilityName,
    facilityType: facilityType,
    borough: facility.borough,
    dateAdded: favoriteDate
  };
  
  const updateResult = await userCollection.updateOne(
    { userId: userId },
    { $push: { favorites: favorite } }
  );
  
  if (updateResult.modifiedCount === 0) {
    throw new Error('Failed to add favorite');
  }
  
  return favorite;
};

export const removeFavorite = async (userId, facilityId) => {
  if (!userId) throw new Error('User ID must be provided');
  if (!facilityId) throw new Error('Facility ID must be provided');
  
  userId = validateString(userId, 'User ID').toLowerCase();
  const numFacilityId = validateNumber(facilityId, 'Facility ID');
  
  const userCollection = await users();
  const user = await userCollection.findOne({ userId: userId });
  if (!user) {
    throw new Error('User not found');
  }
  
  const isFavorited = user.favorites.some(fav => fav.facilityId === numFacilityId);
  if (!isFavorited) {
    throw new Error('This facility is not in your favorites');
  }
  
  const updateResult = await userCollection.updateOne(
    { userId: userId },
    { $pull: { favorites: { facilityId: numFacilityId } } }
  );
  
  if (updateResult.modifiedCount === 0) {
    throw new Error('Failed to remove favorite');
  }
  
  return { removed: true };
};

export const getUserFavorites = async (userId) => {
  if (!userId) throw new Error('User ID must be provided');
  
  userId = validateString(userId, 'User ID').toLowerCase();
  
  const userCollection = await users();
  const user = await userCollection.findOne({ userId: userId });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  let favorites = [];
  if (user.favorites) {
    favorites = user.favorites;
  }
  
  return favorites;
};

export const isFavorite = async (userId, facilityId) => {
  if (!userId) throw new Error('User ID must be provided');
  if (!facilityId) throw new Error('Facility ID must be provided');
  
  userId = validateString(userId, 'User ID').toLowerCase();
  const numFacilityId = validateNumber(facilityId, 'Facility ID');
  
  try {
    const userCollection = await users();
    const user = await userCollection.findOne({ userId: userId });
    
    if (!user) {
      return false;
    }
    
    return user.favorites.some(fav => fav.facilityId === numFacilityId);
  } catch (e) {
    return false;
  }
};

export const getFavoriteCount = async (userId) => {
  if (!userId) throw new Error('User ID must be provided');
  
  userId = validateString(userId, 'User ID').toLowerCase();
  
  const userCollection = await users();
  const user = await userCollection.findOne({ userId: userId });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  let count = 0;
  if (user.favorites) {
    count = user.favorites.length;
  }
  
  return count;
};

export const getFavoritesByType = async (userId, facilityType) => {
  if (!userId) throw new Error('User ID must be provided');
  if (!facilityType) throw new Error('Facility type must be provided');
  
  userId = validateString(userId, 'User ID').toLowerCase();
  facilityType = validateString(facilityType, 'Facility type');
  
  if (facilityType !== 'park' && facilityType !== 'rec_center') {
    throw new Error('Facility type must be either "park" or "rec_center"');
  }
  
  const favorites = await getUserFavorites(userId);
  return favorites.filter(fav => fav.facilityType === facilityType);
};

export const getFavoritesByBorough = async (userId, borough) => {
  if (!userId) throw new Error('User ID must be provided');
  if (!borough) throw new Error('Borough must be provided');
  
  userId = validateString(userId, 'User ID').toLowerCase();
  borough = validateString(borough, 'Borough');
  
  const validBoroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
  if (!validBoroughs.includes(borough)) {
    throw new Error(`Borough must be one of: ${validBoroughs.join(', ')}`);
  }
  
  const favorites = await getUserFavorites(userId);
  return favorites.filter(fav => fav.borough === borough);
};