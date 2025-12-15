import { Router } from 'express';
import { getFacilityById, getFacilityStats, updateFacilityLikes, searchFacilitiesByName, filterFacilities, getAllBoroughs, getAllParkTypes, getTopRatedFacilities, addFacility, deleteFacility} from '../data/facilities.js';
import { addReview, updateReview, deleteReview, getReviewsByFacility, hasUserReviewed, markReviewHelpful} from '../data/reviews.js';
import { addFavorite, removeFavorite, isFavorite } from '../data/favorites.js';
import { parks, rec_centers } from '../config/mongoCollections.js';

const router = Router();

//make it so admin can only add/delete facilities
const requireAdmin = (req, res, next) => 
{
  if (!req.session.user || req.session.user.role !== "admin") 
  {
    return res.status(403).render("error", 
    {
      title: "Access Denied",
      error: "Admin access required",
      user: req.session.user
    });
  }
  next();
};

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

    const review = await getReviewByUserAndFacility(facilityId, req.session.user.userId);
    if (!review) 
    {
      throw new Error('You have not reviewed this facility');
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
    const userId = req.session.user.userId;

    const review = await getReviewByUserAndFacility(facilityId, userId);

    //allow delete of review if admind or owner of review
    if(!review && req.session.user.role !== 'admin')
    {
      throw new Error('You are not authorized to delete this review');
    }

    //admin can delete any review
    const targetUserId = review ? userId : req.body.targetUserId; 
    
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

//to add / delete facilities
router.post('/facility/add',requireAdmin, async(req,res) =>
{
  try {
    await addFacility(req.body);
    res.redirect('/');
  } catch (e) {
    return res.status(400).render('error', { 
      error: e.message || 'Failed to add facility', 
      user: req.session.user 
    });
  }
});

router.delete('/facility/:id', requireAdmin, async(req,res) =>
{
  try {
    const facilityId = req.params.id;
    await deleteFacility(facilityId);
    res.redirect('/');
  } catch (e) {
    return res.status(400).render('error', {
      error: e.message || 'Failed to delete facility',
      user: req.session.user
    });
  }
});
router.route('/map').get(async (req, res) => {
  try {
    const park = await parks();
    const rec = await rec_centers();
    
    const allParks = await park.find({}).toArray();
    const allRecs = await rec.find({}).toArray();
    const facilities = [...allParks, ...allRecs];

    const facilitiesWithCoords = facilities.filter(f => f.lat && f.lng);
    
    return res.render('map', {
      facilitiesJson: JSON.stringify(facilitiesWithCoords),
      user: req.session.user
    });
  } catch (e) {
    return res.status(500).render('error', {
      error: e.message || 'Failed to load map',
      user: req.session.user
    });
  }
});
    

export default router;
