import { Router } from 'express';
import { getFacilityById, getFacilityStats, updateFacilityLikes, searchFacilitiesByName, filterFacilities, getAllBoroughs, getAllParkTypes, getTopRatedFacilities} from '../data/facilities.js';
import { addReview, updateReview, deleteReview, getReviewsByFacility, hasUserReviewed, markReviewHelpful} from '../data/reviews.js';
import { addFavorite, removeFavorite, isFavorite } from '../data/favorites.js';

const router = Router();

router.route('/facility/:id').get(async (req, res) => {
  try {
    const facilityId = req.params.id;

    const facility = await getFacilityById(facilityId);
    const stats = await getFacilityStats(facilityId);
    const reviews = await getReviewsByFacility(facilityId);
    
    let userFavorited = false;
    let userHasReviewed = false;
    let userReview = null;
    
    if (req.session.user) {
      userFavorited = await isFavorite(req.session.user.userId, facilityId);
      userHasReviewed = await hasUserReviewed(facilityId, req.session.user.userId);
      
      if (userHasReviewed) {
        userReview = reviews.find(r => r.userId === req.session.user.userId);
      }
    }
    
    return res.render('facility_detail', {
      facility,
      stats,
      reviews,
      userFavorited,
      userHasReviewed,
      userReview,
      user: req.session.user
    });
  } catch (e) {
    return res.status(404).render('error', { 
      error: e.message || 'Facility not found',
      user: req.session.user 
    });
  }
});

router.route('/facility/:id/review').post(async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  try {
    const facilityId = req.params.id;
    let { rating, comment } = req.body;

    if (!rating) {
      throw new Error('Rating is required');
    }
    
    rating = Number(rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    if (!comment) {
      comment = '';
    }
    
    await addReview(
      facilityId,
      req.session.user.userId,
      rating,
      comment
    );
    
    return res.redirect(`/facility/${facilityId}`);
  } catch (e) {
    return res.status(400).render('error', { 
      error: e.message || 'Failed to add review',
      user: req.session.user 
    });
  }
});

router.route('/facility/:id/review/update').post(async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  try {
    const facilityId = req.params.id;
    let { rating, comment } = req.body;
    
    if (!rating) {
      throw new Error('Rating is required');
    }
    
    rating = Number(rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (!comment) {
      comment = '';
    }
    
    await updateReview(
      facilityId,
      req.session.user.userId,
      rating,
      comment
    );
    
    return res.redirect(`/facility/${facilityId}`);
  } catch (e) {
    return res.status(400).render('error', { 
      error: e.message || 'Failed to update review',
      user: req.session.user 
    });
  }
});

router.route('/facility/:id/review/delete').post(async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  try {
    const facilityId = req.params.id;
    
    await deleteReview(facilityId, req.session.user.userId);
    
    return res.redirect(`/facility/${facilityId}`);
  } catch (e) {
    return res.status(400).render('error', { 
      error: e.message || 'Failed to delete review',
      user: req.session.user 
    });
  }
});

router.route('/facility/:id/favorite').post(async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const facilityId = req.params.id;
    const { action } = req.body;
    
    if (action === 'add') {
      await addFavorite(req.session.user.userId, facilityId);
      return res.json({ success: true, favorited: true });
    } else if (action === 'remove') {
      await removeFavorite(req.session.user.userId, facilityId);
      return res.json({ success: true, favorited: false });
    } else {
      throw new Error('Invalid action');
    }
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Failed to update favorite' });
  }
});

router.route('/facility/:id/like').post(async (req, res) => {
  try {
    const facilityId = req.params.id;
    const { type } = req.body;
    
    let isLike = true;
    if (type === 'dislike') {
      isLike = false;
    }
    
    const updatedFacility = await updateFacilityLikes(facilityId, isLike);
    
    return res.json({ 
      success: true, 
      likes: updatedFacility.likes || 0,
      dislikes: updatedFacility.dislikes || 0
    });
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Failed to update likes' });
  }
});

router.route('/facility/:id/review/:userId/helpful').post(async (req, res) => {
  try {
    const facilityId = req.params.id;
    const reviewUserId = req.params.userId;
    
    const result = await markReviewHelpful(facilityId, reviewUserId);
    
    return res.json({ 
      success: true, 
      newHelpfulCount: result.newHelpfulCount 
    });
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Failed to mark review as helpful' });
  }
});

router.route('/search').get(async (req, res) => {
  try {
    const { query, borough, zipcode, facilityType, parkType, page = 0 } = req.query;
    
    let results = [];
    let searchPerformed = false;
    
    if (query && query.trim().length > 0) {
      results = await searchFacilitiesByName(query.trim(), Number(page), 10);
      searchPerformed = true;
    } 
    else if (borough || zipcode || facilityType || parkType) {
      const filters = {};
      if (borough) filters.borough = borough;
      if (zipcode) filters.zipcode = zipcode;
      if (facilityType) filters.facilityType = facilityType;
      if (parkType) filters.parkType = parkType;
      
      results = await filterFacilities(filters, Number(page), 10);
      searchPerformed = true;
    }
    
    const boroughs = await getAllBoroughs();
    const parkTypes = await getAllParkTypes();
    
    const currentPage = Number(page);
    const nextPage = currentPage + 1;
    const prevPage = currentPage > 0 ? currentPage - 1 : 0;
    
    return res.render('search', {
      results,
      searchPerformed,
      query: query || '',
      filters: {
        borough: borough || '',
        zipcode: zipcode || '',
        facilityType: facilityType || '',
        parkType: parkType || ''
      },
      boroughs,
      parkTypes,
      currentPage,
      nextPage,
      prevPage,
      hasResults: results.length > 0,
      user: req.session.user
    });
  } catch (e) {
    return res.status(500).render('error', { 
      error: e.message || 'Search failed',
      user: req.session.user 
    });
  }
});

router.route('/top-rated').get(async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const topFacilities = await getTopRatedFacilities(Number(limit));
    
    return res.render('top_rated', {
      facilities: topFacilities,
      user: req.session.user
    });
  } catch (e) {
    return res.status(500).render('error', { 
      error: e.message || 'Failed to load top rated facilities',
      user: req.session.user 
    });
  }
});

export default router;