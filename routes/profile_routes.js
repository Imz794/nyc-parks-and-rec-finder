import { Router } from 'express';
import { getUserFavorites, getFavoritesByType, getFavoritesByBorough } from '../data/favorites.js';
import { getReviewsByUser } from '../data/reviews.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

router.route('/profile').get(requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    
    const favorites = await getUserFavorites(userId);
    const reviews = await getReviewsByUser(userId);
    
    const totalFavorites = favorites.length;
    const totalReviews = reviews.length;
    
    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      avgRating = Math.round((sum / reviews.length) * 10) / 10;
    }
    
    return res.render('profile', {
      user: req.session.user,
      favorites,
      reviews,
      stats: {
        totalFavorites,
        totalReviews,
        avgRating
      }
    });
  } catch (e) {
    return res.status(500).render('error', { 
      error: e.message || 'Failed to load profile',
      user: req.session.user 
    });
  }
});

router.route('/profile/favorites').get(requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const { type, borough } = req.query;
    
    let favorites;
    
    if (type) {
      favorites = await getFavoritesByType(userId, type);
    } else if (borough) {
      favorites = await getFavoritesByBorough(userId, borough);
    } else {
      favorites = await getUserFavorites(userId);
    }
    
    return res.render('user_favorites', {
      user: req.session.user,
      favorites,
      filters: {
        type: type || '',
        borough: borough || ''
      },
      totalFavorites: favorites.length
    });
  } catch (e) {
    return res.status(500).render('error', { 
      error: e.message || 'Failed to load favorites',
      user: req.session.user 
    });
  }
});

router.route('/profile/reviews').get(requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const reviews = await getReviewsByUser(userId);
    
    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      avgRating = Math.round((sum / reviews.length) * 10) / 10;
    }
    
    return res.render('user_reviews', {
      user: req.session.user,
      reviews,
      totalReviews: reviews.length,
      avgRating
    });
  } catch (e) {
    return res.status(500).render('error', { 
      error: e.message || 'Failed to load reviews',
      user: req.session.user 
    });
  }
});

export default router;