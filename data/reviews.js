import { parks, rec_centers, users } from '../config/mongoCollections.js';
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

export const addReview = async (facilityId, userId, rating, comment = '') => {
  if (!facilityId) throw new Error('Facility ID must be provided');
  if (!userId) throw new Error('User ID must be provided');
  
  const numFacilityId = validateNumber(facilityId, 'Facility ID');
  userId = validateString(userId, 'User ID').toLowerCase();
  rating = validateNumber(rating, 'Rating', 1, 5);
  
  if (comment && typeof comment !== 'string') {
    throw new Error('Comment must be a string');
  }
  comment = comment.trim();

  const facility = await getFacilityById(numFacilityId);
  
  const userCollection = await users();
  const user = await userCollection.findOne({ userId: userId });
  if (!user) {
    throw new Error('User not found');
  }

  const existingReview = facility.rating.find(r => r.userId === userId);
  if (existingReview) {
    throw new Error('You have already reviewed this facility. Use updateReview to modify your review.');
  }

  const date = new Date();
  const reviewDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  
  const review = {
    userId: userId,
    rating: rating,
    comment: comment,
    date: reviewDate,
    helpful: 0
  };

  const collection = facility.park ? await parks() : await rec_centers();
  const updateResult = await collection.updateOne(
    { _id: numFacilityId },
    { $push: { rating: review } }
  );
  
  if (updateResult.modifiedCount === 0) {
    throw new Error('Failed to add review to facility');
  }

  const userUpdateResult = await userCollection.updateOne(
    { userId: userId },
    { 
      $push: { 
        reviews: {
          facilityId: numFacilityId,
          facilityName: facility.parkName || facility.recCenterName,
          rating: rating,
          comment: comment,
          date: reviewDate
        }
      } 
    }
  );
  
  if (userUpdateResult.modifiedCount === 0) {
    throw new Error('Failed to add review to user profile');
  }
  
  return review;
};

export const updateReview = async (facilityId, userId, newRating, newComment) => {
  if (!facilityId) throw new Error('Facility ID must be provided');
  if (!userId) throw new Error('User ID must be provided');
  
  const numFacilityId = validateNumber(facilityId, 'Facility ID');
  userId = validateString(userId, 'User ID').toLowerCase();
  newRating = validateNumber(newRating, 'Rating', 1, 5);
  
  if (newComment && typeof newComment !== 'string') {
    throw new Error('Comment must be a string');
  }
  newComment = newComment.trim();
  
  const facility = await getFacilityById(numFacilityId);

  const existingReview = facility.rating.find(r => r.userId === userId);
  if (!existingReview) {
    throw new Error('You have not reviewed this facility yet');
  }

  const date = new Date();
  const reviewDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  
  const collection = facility.park ? await parks() : await rec_centers();
  const updateResult = await collection.updateOne(
    { _id: numFacilityId, 'rating.userId': userId },
    { 
      $set: { 
        'rating.$.rating': newRating,
        'rating.$.comment': newComment,
        'rating.$.date': reviewDate
      } 
    }
  );
  
  if (updateResult.modifiedCount === 0) {
    throw new Error('Failed to update review in facility');
  }
  
  const userCollection = await users();
  const userUpdateResult = await userCollection.updateOne(
    { userId: userId, 'reviews.facilityId': numFacilityId },
    { 
      $set: { 
        'reviews.$.rating': newRating,
        'reviews.$.comment': newComment,
        'reviews.$.date': reviewDate
      } 
    }
  );
  
  if (userUpdateResult.modifiedCount === 0) {
    throw new Error('Failed to update review in user profile');
  }
  
  return {
    userId: userId,
    rating: newRating,
    comment: newComment,
    date: reviewDate,
    helpful: existingReview.helpful
  };
};

export const deleteReview = async (facilityId, userId) => {
  if (!facilityId) throw new Error('Facility ID must be provided');
  if (!userId) throw new Error('User ID must be provided');
  
  const numFacilityId = validateNumber(facilityId, 'Facility ID');
  userId = validateString(userId, 'User ID').toLowerCase();

  const facility = await getFacilityById(numFacilityId);

  const existingReview = facility.rating.find(r => r.userId === userId);
  if (!existingReview) {
    throw new Error('You have not reviewed this facility');
  }

  const collection = facility.park ? await parks() : await rec_centers();
  const updateResult = await collection.updateOne(
    { _id: numFacilityId },
    { $pull: { rating: { userId: userId } } }
  );
  
  if (updateResult.modifiedCount === 0) {
    throw new Error('Failed to delete review from facility');
  }
  
  // Remove review from user profile
  const userCollection = await users();
  const userUpdateResult = await userCollection.updateOne(
    { userId: userId },
    { $pull: { reviews: { facilityId: numFacilityId } } }
  );
  
  if (userUpdateResult.modifiedCount === 0) {
    throw new Error('Failed to delete review from user profile');
  }
  
  return { deleted: true };
};

export const getReviewsByFacility = async (facilityId) => {
  if (!facilityId) throw new Error('Facility ID must be provided');
  
  const facility = await getFacilityById(facilityId);
  return facility.rating || [];
};

export const getReviewsByUser = async (userId) => {
  if (!userId) throw new Error('User ID must be provided');
  
  userId = validateString(userId, 'User ID').toLowerCase();
  
  const userCollection = await users();
  const user = await userCollection.findOne({ userId: userId });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user.reviews || [];
};

export const hasUserReviewed = async (facilityId, userId) => {
  if (!facilityId) throw new Error('Facility ID must be provided');
  if (!userId) throw new Error('User ID must be provided');
  
  const numFacilityId = validateNumber(facilityId, 'Facility ID');
  userId = validateString(userId, 'User ID').toLowerCase();
  
  try {
    const facility = await getFacilityById(numFacilityId);
    const review = facility.rating.find(r => r.userId === userId);
    return review ? true : false;
  } catch (e) {
    return false;
  }
};

export const markReviewHelpful = async (facilityId, reviewUserId) => {
  if (!facilityId) throw new Error('Facility ID must be provided');
  if (!reviewUserId) throw new Error('Review user ID must be provided');
  
  const numFacilityId = validateNumber(facilityId, 'Facility ID');
  reviewUserId = validateString(reviewUserId, 'Review user ID').toLowerCase();
  
  const facility = await getFacilityById(numFacilityId);
  
  const review = facility.rating.find(r => r.userId === reviewUserId);
  if (!review) {
    throw new Error('Review not found');
  }
  
  const collection = facility.park ? await parks() : await rec_centers();
  const updateResult = await collection.updateOne(
    { _id: numFacilityId, 'rating.userId': reviewUserId },
    { $inc: { 'rating.$.helpful': 1 } }
  );
  
  if (updateResult.modifiedCount === 0) {
    throw new Error('Failed to mark review as helpful');
  }
  
  return { success: true, newHelpfulCount: review.helpful + 1 };
};