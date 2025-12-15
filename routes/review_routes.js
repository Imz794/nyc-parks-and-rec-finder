import {Router} from 'express';
const router = Router();
import { parkList, recList } from '../data/parks_rec.js';
import { getFacilityById, hasReviewed } from '../data/facilities.js';
import { parks, rec_centers } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { addReview, deleteReview, updateReview } from '../data/reviews.js';

const requireAdmin = (req, res, next) => 
{
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).render("error", {
      title: "Access Denied",
      error: "Admin access required",
      user: req.session.user
    });
  }
  next();
};

router.route('/parks/:_id/rating').get(async (req, res) => {
    let p = await getFacilityById(req.params._id);
    let user = req.session.user;

    let newrate = p.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    res.render('park_rating', { park: {...p, rating: newrate}, user: user });
});

router.route('/parks/:_id/rating').post(async (req, res) => {
    let errors = [];
    let p = await getFacilityById(req.params._id);

    if(req.session.user == null){
        return res.status(400).render('park_rating', {errors: "You must sign in to review", login: true, park: p});
    }
    let user = req.session.user;

    let newrate = p.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(await hasReviewed(user.userId, p._id)){
        return res.status(400).render('park_rating', {errors: "You have already reviewed this facility", park: {...p, rating: newrate}, user: user });
    }

    if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
        return res.status(400).render('park_rating', {errors: "Review cannot be empty", park: {...p, rating: newrate}, user: user });
    }
    let review = req.body.reviewbox.trim();
    let title = req.body.reviewtitle.trim();
    let rating = Number(req.body.rating);

    if(typeof(review) != 'string' || review.length == 0 || review == ''){
        errors.push("Review cannot be empty");
    }
    if(review.length > 500){
        errors.push("Max length for review is 500 characters");
    }

    if(typeof(title) != 'string' || title.length == 0 || title == ''){
        errors.push("Title cannot be empty");
    }
    if(title.length > 35){
        errors.push("Max length for title is 35 characters");
    }

    if(isNaN(rating) || rating < 1 || rating > 5){
        errors.push("Rating must be between 1 and 5");
    }

    if(errors.length > 0){
        return res.status(400).render('park_rating', {errors: errors.join(", "), park: {...p, rating: newrate}, user: user });
    }

    try{
        await addReview(p._id, user.userId, title, rating, review);
    } catch (e) {
        return res.status(400).render('park_rating', {errors: e.message, park: {...p, rating: newrate}, user: user });
    }

    res.redirect(`/parks/${p._id}/rating`);
});

router.route('/rec_centers/:_id/rating').get(async (req, res) => {
    let r = await getFacilityById(req.params._id);

    let user = req.session.user;

    let newrate = r.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    res.render('rec_rating', { rec: {...r, rating: newrate}, user: user });
});

router.route('/rec_centers/:_id/rating').post(async (req, res) => {
    let errors = [];
    let r = await getFacilityById(req.params._id);

    if(req.session.user == null){
        return res.status(400).render('park_rating', {errors: "You must sign in to review", login: true, rec: r});
    }
    let user = req.session.user;

    let newrate = r.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(await hasReviewed(user.userId, r._id)){
        return res.status(400).render('park_rating', {errors: "You have already reviewed this facility", rec: {...r, rating: newrate}, user: user });
    }

    if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
        return res.status(400).render('park_rating', {errors: "Review cannot be empty", rec: {...r, rating: newrate}, user: user });
    }
    let review = req.body.reviewbox.trim();
    let title = req.body.reviewtitle.trim();
    let rating = Number(req.body.rating);

    if(typeof(review) != 'string' || review.length == 0 || review == ''){
        errors.push("Review cannot be empty");
    }
    if(review.length > 500){
        errors.push("Max length for review is 500 characters");
    }

    if(typeof(title) != 'string' || title.length == 0 || title == ''){
        errors.push("Title cannot be empty");
    }
    if(title.length > 35){
        errors.push("Max length for title is 35 characters");
    }

    if(isNaN(rating) || rating < 1 || rating > 5){
        errors.push("Rating must be between 1 and 5");
    }

    if(errors.length > 0){
        return res.status(400).render('rec_rating', {errors: errors.join(", "), rec: {...r, rating: newrate}, user: user });
    }

    try{
        await addReview(r._id, user.userId, title, rating, review);
    } catch (e) {
        return res.status(400).render('rec_rating', {errors: e.message, rec: {...r, rating: newrate}, user: user });
    }

    res.redirect(`/rec_centers/${r._id}/rating`);
});

router.route('/parks/:_id/rating/:revid/edit').get(async (req, res) => {
    if(!req.session.user){
        return res.status(400).redirect('/login');
    }
    let p = await getFacilityById(req.params._id);
    let revid = req.params.revid;
    let review = p.rating.find(r => r._id.toString() == revid);

    res.render('edit_park', { review: review, park: p, user: req.session.user});
});

router.route('/parks/:_id/rating/:revid/edit').post(async (req, res) => {
    let errors = [];
    let p = await getFacilityById(req.params._id);
    let revid = req.params.revid;
    let rind = p.rating.findIndex(r => r._id.toString() == revid);

    if(rind == -1){
        errors.push("Review not found");
    }

    if(req.session.user == null){
        return res.status(400).render('edit_park', {errors: "You must sign in to review", login: true, park: p});
    }
    let user = req.session.user;

    if(p.rating[rind].userId != user.userId && user.role !== 'admin'){
        return res.status(400).render('edit_park', {errors: "You do not have access to edit this review", park: p,  user: user});
    }

    let newrate = p.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
        return res.status(400).render('park_rating', {errors: "Review cannot be empty", park: {...p, rating: newrate}, user: user});
    }
    let review = req.body.reviewbox.trim();
    let title = req.body.reviewtitle.trim();
    let rating = Number(req.body.rating);

    if(typeof(review) != 'string' || review.length == 0 || review == ''){
        errors.push("Review cannot be empty");
    }
    if(review.length > 500){
        errors.push("Max length for review is 500 characters");
    }

    if(typeof(title) != 'string' || title.length == 0 || title == ''){
        errors.push("Title cannot be empty");
    }
    if(title.length > 35){
        errors.push("Max length for title is 35 characters");
    }

    if(isNaN(rating) || rating < 1 || rating > 5){
        errors.push("Rating must be between 1 and 5");
    }

    if(errors.length > 0){
        return res.status(400).render('edit_park', {errors: errors.join(", "), park: {...p, rating: newrate}, user: user});
    }

    try{
        await updateReview(p._id, user.userId, title, rating, review);
    }
    catch(e){
        return res.status(400).render('edit_park', {errors: e.message, park: {...p, rating: newrate}, user: user });
    }

    res.redirect(`/parks/${p._id}/rating`);
});

router.route('/rec_centers/:_id/rating/:revid/edit').get(async (req, res) => {
    if(!req.session.user){
        return res.status(400).redirect('/login');
    }
    let r = await getFacilityById(req.params._id);
    let revid = req.params.revid;
    let review = r.rating.find(r => r._id.toString() == revid);

    res.render('edit_rec', { review: review, rec: r, user: req.session.user });
});

router.route('/rec_centers/:_id/rating/:revid/edit').post(async (req, res) => {
    let errors = [];
    let r = await getFacilityById(req.params._id);
    let revid = req.params.revid;
    let rind = r.rating.findIndex(r => r._id.toString() == revid);
    if(rind == -1){
        errors.push("Review not found");
    }

    if(req.session.user == null){
        return res.status(400).render('edit_rec', {errors: "You must sign in to review", login: true, rec: r});
    }
    let user = req.session.user;

    if(r.rating[rind].userId != user.userId && user.role !== 'admin'){
        return res.status(400).render('edit_rec', {errors: "You do not have access to edit this review", rec: r, user: user});
    }

    let newrate = r.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
        return res.status(400).render('edit_rec', {errors: "Review cannot be empty", rec: {...r, rating: newrate}, user: user});
    }
    let review = req.body.reviewbox.trim();
    let title = req.body.reviewtitle.trim();
    let rating = Number(req.body.rating);

    if(typeof(review) != 'string' || review.length == 0 || review == ''){
        errors.push("Review cannot be empty");
    }
    if(review.length > 500){
        errors.push("Max length for review is 500 characters");
    }

    if(typeof(title) != 'string' || title.length == 0 || title == ''){
        errors.push("Title cannot be empty");
    }
    if(title.length > 35){
        errors.push("Max length for title is 35 characters");
    }

    if(isNaN(rating) || rating < 1 || rating > 5){
        errors.push("Rating must be between 1 and 5");
    }

    if(errors.length > 0){
        return res.status(400).render('edit_rec', {errors: errors.join(", "), rec: {...r, rating: newrate}, user: user});
    }

    try{
        await updateReview(r._id, user.userId, title, rating, review);
    }
    catch(e){
        return res.status(400).render('edit_rec', {errors: e.message, rec: {...r, rating: newrate}, user: user });
    }

    res.redirect(`/rec_centers/${r._id}/rating`);
});

router.route('/parks/:_id/rating/:revid/delete').post(async (req, res) => {
    let errors = [];
    let p = await getFacilityById(req.params._id);
    let revid = req.params.revid;
    let rind = p.rating.findIndex(r => r._id.toString() == revid);

    if(rind == -1){
        errors.push("Review not found");
    }

    if(req.session.user == null){
        return res.status(400).render('park_rating', {errors: "You must sign in to review", login: true, park: p});
    }
    let user = req.session.user;

    if(p.rating[rind].userId != user.userId && user.role !== 'admin'){
        return res.status(400).render('park_rating', {errors: "You do not have access to delete this review", park: p, user: user});
    }

    let newrate = p.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(errors.length > 0){
        return res.status(400).render('park_rating', {errors: errors.join(", "), park: {...p, rating: newrate}, user: user});
    }

    try{
        const reviewOwnerUserId = p.rating[rind].userId;
        await deleteReview(p._id, reviewOwnerUserId);
    }
    catch(e){
        return res.status(400).render('park_rating', {errors: e.message, park: {...p, rating: newrate}, user: user });
    }

    res.redirect(`/parks/${p._id}/rating`);
});

router.route('/rec_centers/:_id/rating/:revid/delete').post(async (req, res) => {
    let errors = [];
    let r = await getFacilityById(req.params._id);
    let revid = req.params.revid;
    let rind = r.rating.findIndex(r => r._id.toString() == revid);

    if(rind == -1){
        errors.push("Review not found");
    }

    if(req.session.user == null){
        return res.status(400).render('rec_rating', {errors: "You must sign in to review", login: true, rec: r});
    }
    let user = req.session.user;

    if(r.rating[rind].userId != user.userId && user.role !== 'admin'){
        return res.status(400).render('rec_rating', {errors: "You do not have access to delete this review", rec: r, user: user});
    }

    let newrate = r.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(errors.length > 0){
        return res.status(400).render('rec_rating', {errors: errors.join(", "), rec: {...r, rating: newrate}, user: user});
    }

    try{
        const reviewOwnerUserId = r.rating[rind].userId;
        await deleteReview(r._id, reviewOwnerUserId);
    }
    catch(e){
        return res.status(400).render('rec_rating', {errors: e.message, rec: {...r, rating: newrate}, user: user });
    }

    res.redirect(`/rec_centers/${r._id}/rating`);
});

export default router;
