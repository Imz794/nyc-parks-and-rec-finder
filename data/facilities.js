import { parks, rec_centers } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { getUserById } from './users.js';

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

export const getFacilityById = async (id) => {
  if (!id) throw new Error('ID must be provided');
  
  // const numId = validateNumber(id, 'Facility ID');
  
  const park = await parks();
  const rec = await rec_centers();

  let facility = await park.findOne({ _id: Number(id) });
  
  if (!facility) {
    facility = await rec.findOne({ _id: id });
  }
  
  if (!facility) {
    throw new Error(`Facility with ID ${id} not found`);
  }
  
  return facility;
};

export const searchFacilitiesByName = async (searchTerm, page = 0, pageSize = 10) => {
  if (!searchTerm) throw new Error('Search term must be provided');
  
  searchTerm = validateString(searchTerm, 'Search term');
  page = validateNumber(page, 'Page number', 0);
  pageSize = validateNumber(pageSize, 'Page size', 1, 100);
  
  const skip = page * pageSize;
  const park = await parks();
  const rec = await rec_centers();

  const regex = new RegExp(searchTerm, 'i');
  
  const parkResults = await park
    .find({ parkName: regex })
    .skip(skip)
    .limit(pageSize)
    .toArray();
    
  const recResults = await rec
    .find({ recCenterName: regex })
    .skip(skip)
    .limit(pageSize)
    .toArray();

  return [...parkResults, ...recResults];
};

export const filterFacilities = async (filters = {}, page = 0, pageSize = 10) => {
  page = validateNumber(page, 'Page number', 0);
  pageSize = validateNumber(pageSize, 'Page size', 1, 100);
  
  const skip = page * pageSize;
  const park = await parks();
  const rec = await rec_centers();
  
  let query = {};
  
  if (filters.borough) {
    query.borough = validateString(filters.borough, 'Borough');
  }
  
  if (filters.zipcode) {
    query.zipcode = validateString(filters.zipcode, 'Zipcode');
  }
  
  let parkResults = [];
  let recResults = [];
  
  if (!filters.facilityType || filters.facilityType === 'park') {
    let parkQuery = { ...query };
    
    if (filters.parkType) {
      parkQuery.type = validateString(filters.parkType, 'Park type');
    }
    
    parkResults = await park
      .find(parkQuery)
      .skip(skip)
      .limit(pageSize)
      .toArray();
  }
  
  if (!filters.facilityType || filters.facilityType === 'rec_center') {
    recResults = await rec
      .find(query)
      .skip(skip)
      .limit(pageSize)
      .toArray();
  }
  
  return [...parkResults, ...recResults];
};

export const getFacilitiesByBorough = async (borough, page = 0, pageSize = 10) => {
  borough = validateString(borough, 'Borough');
  page = validateNumber(page, 'Page number', 0);
  pageSize = validateNumber(pageSize, 'Page size', 1, 100);
  
  const validBoroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
  if (!validBoroughs.includes(borough)) {
    throw new Error(`Borough must be one of: ${validBoroughs.join(', ')}`);
  }
  
  return await filterFacilities({ borough }, page, pageSize);
};

export const getFacilitiesByZipcode = async (zipcode, page = 0, pageSize = 10) => {
  zipcode = validateString(zipcode, 'Zipcode');
  page = validateNumber(page, 'Page number', 0);
  pageSize = validateNumber(pageSize, 'Page size', 1, 100);
  
  if (!/^\d{5}$/.test(zipcode)) {
    throw new Error('Zipcode must be a 5-digit number');
  }
  
  return await filterFacilities({ zipcode }, page, pageSize);
};

export const getTopRatedFacilities = async (limit = 10) => {
  limit = validateNumber(limit, 'Limit', 1, 100);
  
  const park = await parks();
  const rec = await rec_centers();
  
  const allParks = await park.find({}).toArray();
  const allRecs = await rec.find({}).toArray();
  const allFacilities = [...allParks, ...allRecs];

  const facilitiesWithAvgRating = allFacilities.map(facility => {
    const ratings = facility.rating || [];
    let avgRating = 0;
    if (ratings.length > 0) {
      avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    }
    
    return {
      ...facility,
      averageRating: avgRating,
      totalReviews: ratings.length
    };
  });

  return facilitiesWithAvgRating
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);
};

export const getMostLikedFacilities = async (limit = 10) => {
  limit = validateNumber(limit, 'Limit', 1, 100);
  
  const park = await parks();
  const rec = await rec_centers();

  const allParks = await park.find({}).toArray();
  const allRecs = await rec.find({}).toArray();
  const allFacilities = [...allParks, ...allRecs];
  
  return allFacilities
    .sort((a, b) => {
      const aLikes = a.likes || 0;
      const bLikes = b.likes || 0;
      return bLikes - aLikes;
    })
    .slice(0, limit);
};

export const updateFacilityLikes = async (facilityId, isLike) => {
  if (!facilityId) throw new Error('Facility ID must be provided');
  
  const numId = validateNumber(facilityId, 'Facility ID');
  const facility = await getFacilityById(numId);
  
  let collection;
  if (facility.park) {
    collection = await parks();
  } else {
    collection = await rec_centers();
  }
  
  let updateField;
  if (isLike) {
    updateField = 'likes';
  } else {
    updateField = 'dislikes';
  }
  
  const updateQuery = { $inc: { [updateField]: 1 } };
  
  const result = await collection.updateOne(
    { _id: numId },
    updateQuery
  );
  
  if (result.modifiedCount === 0) {
    throw new Error('Failed to update facility likes/dislikes');
  }
  
  return await getFacilityById(numId);
};

export const getFacilityStats = async (facilityId) => {
  if (!facilityId) throw new Error('Facility ID must be provided');
  
  const facility = await getFacilityById(facilityId);
  
  const ratings = facility.rating || [];
  const comments = facility.comments || [];
  
  let avgRating = 0;
  if (ratings.length > 0) {
    avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  }
  
  let facilityName;
  if (facility.parkName) {
    facilityName = facility.parkName;
  } else {
    facilityName = facility.recCenterName;
  }
  
  let likes = 0;
  if (facility.likes) {
    likes = facility.likes;
  }
  
  let dislikes = 0;
  if (facility.dislikes) {
    dislikes = facility.dislikes;
  }
  
  return {
    facilityId: facility._id,
    facilityName: facilityName,
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: ratings.length,
    totalComments: comments.length,
    likes: likes,
    dislikes: dislikes,
    popularityScore: likes - dislikes
  };
};

export const getAllBoroughs = async () => {
  const park = await parks();
  const rec = await rec_centers();
  
  const parkBoroughs = await park.distinct('borough');
  const recBoroughs = await rec.distinct('borough');

  return [...new Set([...parkBoroughs, ...recBoroughs])].sort();
};

export const getAllParkTypes = async () => {
  const park = await parks();
  return await park.distinct('type');
};

export const getFacilityCount = async (filters = {}) => {
  const park = await parks();
  const rec = await rec_centers();
  
  let parkQuery = {};
  let recQuery = {};
  
  if (filters.borough) {
    parkQuery.borough = filters.borough;
    recQuery.borough = filters.borough;
  }
  
  if (filters.zipcode) {
    parkQuery.zipcode = filters.zipcode;
    recQuery.zipcode = filters.zipcode;
  }
  
  let parkCount = 0;
  let recCount = 0;
  
  if (filters.facilityType === 'rec_center') {
    parkCount = 0;
  } else {
    parkCount = await park.countDocuments(parkQuery);
  }
  
  if (filters.facilityType === 'park') {
    recCount = 0;
  } else {
    recCount = await rec.countDocuments(recQuery);
  }
  
  return {
    totalParks: parkCount,
    totalRecCenters: recCount,
    total: parkCount + recCount
  };
};

export const hasReviewed = async (userId, facilityId) => {
  if(!userId){
    throw new Error('Must provide user ID');
  }
  if(!facilityId){
    throw new Error('Must provide facility ID');
  }

  let facility = await getFacilityById(facilityId);

  for(let i of facility.rating){
    if(i.userId == userId){
      return true;
    }
  }
  return false;
};