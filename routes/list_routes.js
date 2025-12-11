import {Router} from 'express';
const router = Router();
import { parkList, recList, getParkById } from '../data/parks_rec.js';
import { parks } from '../config/mongoCollections.js';

router.route('/rec_centers/:page').get(async (req, res) => {
  let page = parseInt(req.params.page, 10);
  if (isNaN(page) || page < 0) {
    return res.status(400).render('error', { error: 'Invalid page number' });
  }

  let back = page > 0 ? page - 1 : 0;
  let next = page + 1;

  const recL = await recList(page);
let comments = recL.slice(0, 3);
  res.render('recs', { recs: recL, comments: comments, next: next, back: back, user: req.session.user });
});

router.route('/rec_centers').get(async (req, res) => {
    res.redirect('/rec_centers/0');
});

router.route('/parks/:page').get(async (req, res) => {
    let page = parseInt(req.params.page, 10);
    if (isNaN(page) || page < 0) {
        return res.status(400).render('error', { error: 'Invalid page number' });
    }

    let back = page > 0 ? page - 1 : 0;
    let next = page + 1;

    const parkL = await parkList(page);
    let comments = parkL.map(p => p.comments = p.comments.slice(0, 3));
    res.render('parks', { parks: parkL, comments: comments, next, back, user: req.session.user });
});

router.route('/parks').get(async (req, res) => {
    res.redirect('/parks/0');
});

router.route('/parks/:_id/comments').get(async (req, res) => {
    let p = await getParkById(req.params._id);
    res.render('comments', { park: p });
});

router.route('/parks/:_id/comments').post(async (req, res) => {
    let errors = [];
    let p = await getParkById(req.params._id);

    if(req.session.user == null){
        return res.status(400).render('comments', {errors: "You must sign in to comment", login: true, park: p});
    }

    let user = req.session.user;

    if(!req.body.commentbox){
        return res.status(400).render('comments', {errors: "Comment cannot be empty", park: p});
    }
    let comment = req.body.commentbox.trim();

    if(typeof(comment) != 'string' || comment.length == 0 || comment == ''){
        errors.push("Comment cannot be empty");
    }
    if(comment.length > 500){
        errors.push("Max length is 500 characters");
    }
    if(errors.length > 0){
        return res.status(400).render('comments', {errors: errors.join(", "), park: p});
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

    let com = {name: `${user.firstName} ${user.lastName}`, comment: comment, date: date};

    p.comments.push(com);
    let ps = await parks();
    await ps.updateOne({_id: p._id}, {$set: {comments: p.comments}});

    res.redirect(`/parks/${p._id}/comments`);
});

router.route('/parks/:_id/rating').get(async (req, res) => {
    let p = await getParkById(req.params._id);
    res.render('rating', { park: p });
});

router.route('/parks/:_id/rating').post(async (req, res) => {
    let errors = [];
    let p = await getParkById(req.params._id);

    if(req.session.user == null){
        return res.status(400).render('rating', {errors: "You must sign in to review", login: true, park: p});
    }

    let user = req.session.user;

    if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
        return res.status(400).render('rating', {errors: "Review cannot be empty", park: p});
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
        return res.status(400).render('rating', {errors: errors.join(", "), park: p});
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

    let rat = {name: `${user.firstName} ${user.lastName}`, title: title, review: review, rating: rating, date: date};
    let score = (p.score + rating) / (p.rating.length + 1);
    score = score.toFixed(2);
    p.rating.push(rat);
    p.score = score;
    let ps = await parks();
    await ps.updateOne({_id: p._id}, {$set: {rating: p.rating, score: score}});

    res.redirect(`/parks/${p._id}/rating`);
});

// router.route('/rec_centers/:_id/comments').get(async (req, res) => {
//     let p = await getParkById(req.params._id);
//     res.render('comments', { park: p });
// });

// router.route('/parks/:_id/comments').post(async (req, res) => {
//     let errors = [];
//     let p = await getParkById(req.params._id);

//     if(req.session.user == null){
//         return res.status(400).render('comments', {errors: "You must sign in to comment", login: true, park: p});
//     }

//     let user = req.session.user;

//     if(!req.body.commentbox){
//         return res.status(400).render('comments', {errors: "Comment cannot be empty", park: p});
//     }
//     let comment = req.body.commentbox.trim();

//     if(typeof(comment) != 'string' || comment.length == 0 || comment == ''){
//         errors.push("Comment cannot be empty");
//     }
//     if(comment.length > 500){
//         errors.push("Max length is 500 characters");
//     }
//     if(errors.length > 0){
//         return res.status(400).render('comments', {errors: errors.join(", "), park: p});
//     }

//     let date = new Date();
//     let month = date.getMonth() + 1;
//     let day = date.getDate();
//     let year = date.getFullYear();
//     let tfhour = date.getHours();
//     let minute = date.getMinutes();
//     let ap = 'AM';
//     if(tfhour >= 12){
//     ap = 'PM';
//     tfhour = tfhour - 12;
//     }
//     if(tfhour == 0){
//     tfhour = 12;
//     }
//     month = String(month).padStart(2, '0');
//     day = String(day).padStart(2, '0');
//     year = String(year);
//     minute = String(minute).padStart(2, '0');
//     tfhour = String(tfhour).padStart(2, '0');
//     let currentDate = `${month}/${day}/${year}`;
//     let currentTime = `${tfhour}:${minute}${ap}`;
//     date = `${currentDate} at ${currentTime}`;

//     let com = {name: `${user.firstName} ${user.lastName}`, comment: comment, date: date};

//     p.comments.push(com);
//     let ps = await parks();
//     await ps.updateOne({_id: p._id}, {$set: {comments: p.comments}});

//     res.redirect(`/parks/${p._id}/comments`);
// });

// router.route('/parks/:_id/rating').get(async (req, res) => {
//     let p = await getParkById(req.params._id);
//     res.render('rating', { park: p });
// });

// router.route('/parks/:_id/rating').post(async (req, res) => {
//     let errors = [];
//     let p = await getParkById(req.params._id);

//     if(req.session.user == null){
//         return res.status(400).render('rating', {errors: "You must sign in to review", login: true, park: p});
//     }

//     let user = req.session.user;

//     if(!req.body.reviewbox || !req.body.reviewtitle || !req.body.rating){
//         return res.status(400).render('rating', {errors: "Review cannot be empty", park: p});
//     }
//     let review = req.body.reviewbox.trim();
//     let title = req.body.reviewtitle.trim();
//     let rating = Number(req.body.rating);

//     if(typeof(review) != 'string' || review.length == 0 || review == ''){
//         errors.push("Review cannot be empty");
//     }
//     if(review.length > 500){
//         errors.push("Max length for review is 500 characters");
//     }

//     if(typeof(title) != 'string' || title.length == 0 || title == ''){
//         errors.push("Title cannot be empty");
//     }
//     if(title.length > 35){
//         errors.push("Max length for title is 35 characters");
//     }

//     if(isNaN(rating) || rating < 1 || rating > 5){
//         errors.push("Rating must be between 1 and 5");
//     }

//     if(errors.length > 0){
//         return res.status(400).render('rating', {errors: errors.join(", "), park: p});
//     }

//     let date = new Date();
//     let month = date.getMonth() + 1;
//     let day = date.getDate();
//     let year = date.getFullYear();
//     let tfhour = date.getHours();
//     let minute = date.getMinutes();
//     let ap = 'AM';
//     if(tfhour >= 12){
//     ap = 'PM';
//     tfhour = tfhour - 12;
//     }
//     if(tfhour == 0){
//     tfhour = 12;
//     }
//     month = String(month).padStart(2, '0');
//     day = String(day).padStart(2, '0');
//     year = String(year);
//     minute = String(minute).padStart(2, '0');
//     tfhour = String(tfhour).padStart(2, '0');
//     let currentDate = `${month}/${day}/${year}`;
//     let currentTime = `${tfhour}:${minute}${ap}`;
//     date = `${currentDate} at ${currentTime}`;

//     let rat = {name: `${user.firstName} ${user.lastName}`, title: title, review: review, rating: rating, date: date};
//     let score = (p.score + rating) / (p.rating.length + 1);
//     score = score.toFixed(2);
//     p.rating.push(rat);
//     p.score = score;
//     let ps = await parks();
//     await ps.updateOne({_id: p._id}, {$set: {rating: p.rating, score: score}});

//     res.redirect(`/parks/${p._id}/rating`);
// });

// export default router;