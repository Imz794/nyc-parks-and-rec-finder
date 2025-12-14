import {Router} from 'express';
const router = Router();
import { parkList, recList } from '../data/parks_rec.js';
import { getFacilityById, hasReviewed } from '../data/facilities.js';
import { parks, rec_centers } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

router.route('/parks/:_id/rating').get(async (req, res) => {
    let p = await getFacilityById(req.params._id);
    let user = req.session.user;

    let newrate = p.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    res.render('park_rating', { park: {...p, rating: newrate} });
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
        return res.status(400).render('park_rating', {errors: "You have already reviewed this facility", park: {...p, rating: newrate} });
    }

    if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
        return res.status(400).render('park_rating', {errors: "Review cannot be empty", park: {...p, rating: newrate} });
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
        return res.status(400).render('park_rating', {errors: errors.join(", "), park: {...p, rating: newrate} } );
    }

    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let tfhour = date.getHours();
    let minute = date.getMinutes();
    let ap = 'AM';
    if(tfhour >= 12){
    ap = 'PM';
    tfhour = tfhour - 12;
    }
    if(tfhour == 0){
    tfhour = 12;
    }
    month = String(month).padStart(2, '0');
    day = String(day).padStart(2, '0');
    year = String(year);
    minute = String(minute).padStart(2, '0');
    tfhour = String(tfhour).padStart(2, '0');
    let currentDate = `${month}/${day}/${year}`;
    let currentTime = `${tfhour}:${minute}${ap}`;
    date = `${currentDate} at ${currentTime}`;

    let rat = {_id: new ObjectId(), name: `${user.firstName} ${user.lastName}`, userId: user.userId, title: title, review: review, rating: rating, date: date};
    let score = 0;
    for(let i = 0; i < p.rating.length; i++){
        score += p.rating[i].rating;
    }
    score = ((score + rating) / (p.rating.length + 1)).toFixed(2);
    p.rating.push(rat);
    p.score = score;
    let ps = await parks();
    await ps.updateOne({_id: p._id}, {$set: {rating: p.rating, score: score}});

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

    res.render('rec_rating', { rec: {...r, rating: newrate} });
});

router.route('/rec_centers/:_id/rating').post(async (req, res) => {
    let errors = [];
    let r = await getFacilityById(req.params._id);

    if(req.session.user == null){
        return res.status(400).render('rec_rating', {errors: "You must sign in to review", login: true, rec: r});
    }
    let user = req.session.user;

    let newrate = r.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(await hasReviewed(user.userId, r._id)){
        return res.status(400).render('rec_rating', {errors: "You have already reviewed this facility", rec: {...r, rating: newrate} });
    }

    if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
        return res.status(400).render('rec_rating', {errors: "Review cannot be empty", rec: {...r, rating: newrate}});
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
        return res.status(400).render('rec_rating', {errors: errors.join(", "), rec: {...r, rating: newrate} });
    }

    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let tfhour = date.getHours();
    let minute = date.getMinutes();
    let ap = 'AM';
    if(tfhour >= 12){
    ap = 'PM';
    tfhour = tfhour - 12;
    }
    if(tfhour == 0){
    tfhour = 12;
    }
    month = String(month).padStart(2, '0');
    day = String(day).padStart(2, '0');
    year = String(year);
    minute = String(minute).padStart(2, '0');
    tfhour = String(tfhour).padStart(2, '0');
    let currentDate = `${month}/${day}/${year}`;
    let currentTime = `${tfhour}:${minute}${ap}`;
    date = `${currentDate} at ${currentTime}`;

    let rat = { _id: new ObjectId(), name: `${user.firstName} ${user.lastName}`, userId: user.userId, title: title, review: review, rating: rating, date: date};
    let score = 0;
    for(let i = 0; i < r.rating.length; i++){
        score += r.rating[i].rating;
    }
    score = ((score + rating) / (r.rating.length + 1)).toFixed(2);
    r.rating.push(rat);
    r.score = score;
    let rs = await rec_centers();
    await rs.updateOne({_id: r._id}, {$set: {rating: r.rating, score: score}});

    res.redirect(`/rec_centers/${r._id}/rating`);
});

router.route('/parks/:_id/rating/:revid/edit').get(async (req, res) => {
    if(!req.session.user){
        return res.status(400).redirect('/login');
    }
    let p = await getFacilityById(req.params._id);
    let revid = req.params.revid;
    let review = p.rating.find(r => r._id.toString() == revid);

    res.render('edit_park', { review: review, park: p });
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

    if(p.rating[rind].userId != user.userId){
        return res.status(400).render('edit_park', {errors: "You do not have access to edit this review", park: p});
    }

    let newrate = p.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
        return res.status(400).render('park_rating', {errors: "Review cannot be empty", park: {...p, rating: newrate}});
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
        return res.status(400).render('edit_park', {errors: errors.join(", "), park: {...p, rating: newrate}});
    }

    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let tfhour = date.getHours();
    let minute = date.getMinutes();
    let ap = 'AM';
    if(tfhour >= 12){
    ap = 'PM';
    tfhour = tfhour - 12;
    }
    if(tfhour == 0){
    tfhour = 12;
    }
    month = String(month).padStart(2, '0');
    day = String(day).padStart(2, '0');
    year = String(year);
    minute = String(minute).padStart(2, '0');
    tfhour = String(tfhour).padStart(2, '0');
    let currentDate = `${month}/${day}/${year}`;
    let currentTime = `${tfhour}:${minute}${ap}`;
    date = `${currentDate} at ${currentTime}`;

    p.rating[rind].title = title;
    p.rating[rind].review = review;
    p.rating[rind].rating = rating;
    p.rating[rind].date = date;

    let score = 0;
    for(let i = 0; i < p.rating.length; i++){
        score += p.rating[i].rating;
    }
    score = (score / (p.rating.length)).toFixed(2);
    p.score = score;

    let ps = await parks();
    await ps.updateOne({_id: p._id}, {$set: {rating: p.rating, score: score}});

    res.redirect(`/parks/${p._id}/rating`);
});

router.route('/rec_centers/:_id/rating/:revid/edit').get(async (req, res) => {
    if(!req.session.user){
        return res.status(400).redirect('/login');
    }
    let r = await getFacilityById(req.params._id);
    let revid = req.params.revid;
    let review = r.rating.find(r => r._id.toString() == revid);

    res.render('edit_rec', { review: review, rec: r });
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

    if(r.rating[rind].userId != user.userId){
        return res.status(400).render('edit_rec', {errors: "You do not have access to edit this review", rec: r});
    }

    let newrate = r.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
        return res.status(400).render('park_rating', {errors: "Review cannot be empty", rec: {...r, rating: newrate}});
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
        return res.status(400).render('edit_rec', {errors: errors.join(", "), rec: {...r, rating: newrate}});
    }

    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let tfhour = date.getHours();
    let minute = date.getMinutes();
    let ap = 'AM';
    if(tfhour >= 12){
    ap = 'PM';
    tfhour = tfhour - 12;
    }
    if(tfhour == 0){
    tfhour = 12;
    }
    month = String(month).padStart(2, '0');
    day = String(day).padStart(2, '0');
    year = String(year);
    minute = String(minute).padStart(2, '0');
    tfhour = String(tfhour).padStart(2, '0');
    let currentDate = `${month}/${day}/${year}`;
    let currentTime = `${tfhour}:${minute}${ap}`;
    date = `${currentDate} at ${currentTime}`;

    r.rating[rind].title = title;
    r.rating[rind].review = review;
    r.rating[rind].rating = rating;
    r.rating[rind].date = date;

    let score = 0;
    for(let i = 0; i < r.rating.length; i++){
        score += r.rating[i].rating;
    }
    score = (score / (r.rating.length)).toFixed(2);
    r.score = score;

    let rc = await rec_centers();
    await rc.updateOne({_id: r._id}, {$set: {rating: r.rating, score: score}});

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

    if(p.rating[rind].userId != user.userId){
        return res.status(400).render('park_rating', {errors: "You do not have access to delete this review", park: p});
    }

    let newrate = p.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(errors.length > 0){
        return res.status(400).render('park_rating', {errors: errors.join(", "), park: {...p, rating: newrate} });
    }

    p.rating = p.rating.filter(p => p._id != revid);

    let score = 0;
    for(let i = 0; i < p.rating.length; i++){
        score += p.rating[i].rating;
    }
    score = (score / (p.rating.length)).toFixed(2);
    if(p.rating.length == 0){
        score = 0;
    }
    p.score = score;



    let ps = await parks();
    await ps.updateOne({_id: p._id}, {$set: {rating: p.rating, score: score}});

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

    if(r.rating[rind].userId != user.userId){
        return res.status(400).render('rec_rating', {errors: "You do not have access to delete this review", rec: r});
    }

    let newrate = r.rating.map(rat => {
        return{
            ...rat,
            reviewed: user && rat.userId == user.userId
        };
    });

    if(errors.length > 0){
        return res.status(400).render('rec_rating', {errors: errors.join(", "), rec: {...r, rating: newrate} });
    }

    r.rating = r.rating.filter(r => r._id != revid);

    let score = 0;
    for(let i = 0; i < r.rating.length; i++){
        score += r.rating[i].rating;
    }
    score = (score / (r.rating.length)).toFixed(2);
    if(r.rating.length == 0){
        score = 0;
    }
    r.score = score;

    let rcs = await rec_centers();
    await rcs.updateOne({_id: r._id}, {$set: {rating: r.rating, score: score}});

    res.redirect(`/rec_centers/${r._id}/rating`);
});

export default router;