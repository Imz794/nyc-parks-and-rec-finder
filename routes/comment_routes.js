import {Router} from 'express';
const router = Router();
import { parkList, recList } from '../data/parks_rec.js';
import { getFacilityById, hasReviewed } from '../data/facilities.js';
import { parks, rec_centers } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';


router.route('/parks/:_id/comments').get(async (req, res) => {
    let p = await getFacilityById(req.params._id);
    let user = req.session.user;
    let newcom = p.comments.map(com => {
        return{
            ...com,
            commented: user && com.userId == user.userId
        };
    });
    res.render('park_comments', { park: {...p, comments: newcom}, user: user });
});

router.route('/parks/:_id/comments').post(async (req, res) => {
    let errors = [];
    let p = await getFacilityById(req.params._id);

    if(req.session.user == null){
        return res.status(400).render('park_comments', {errors: "You must sign in to comment", login: true, park: p});
    }

    let user = req.session.user;

    let newcom = p.comments.map(com => {
        return{
            ...com,
            commented: user && com.userId == user.userId
        };
    });

    if(!req.body.commentbox){
        return res.status(400).render('park_comments', {errors: "Comment cannot be empty", park: {...p, comments: newcom}, user: user});
    }
    let comment = req.body.commentbox.trim();

    if(typeof(comment) != 'string' || comment.length == 0 || comment == ''){
        errors.push("Comment cannot be empty");
    }
    if(comment.length > 500){
        errors.push("Max length is 500 characters");
    }
    if(errors.length > 0){
        return res.status(400).render('park_comments', {errors: errors.join(", "), park: {...p, comments: newcom}, user: user});
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

    let com = { _id: new ObjectId(), name: `${user.firstName} ${user.lastName}`, userId: user.userId, comment: comment, date: date};

    p.comments.push(com);
    let ps = await parks();
    await ps.updateOne({_id: p._id}, {$set: {comments: p.comments}});

    res.redirect(`/parks/${p._id}/comments`);
});

router.route('/rec_centers/:_id/comments').get(async (req, res) => {
    let r = await getFacilityById(req.params._id);
    let user = req.session.user;
    let newcom = r.comments.map(com => {
        return{
            ...com,
            commented: user && com.userId == user.userId
        };
    });
    res.render('rec_comments', { rec: {...r, comments: newcom}, user: user});
});

router.route('/rec_centers/:_id/comments').post(async (req, res) => {
    let errors = [];
    let r = await getFacilityById(req.params._id);

    if(req.session.user == null){
        return res.status(400).render('rec_comments', {errors: "You must sign in to comment", login: true, rec: r});
    }

    let user = req.session.user;
    let newcom = r.comments.map(com => {
        return{
            ...com,
            commented: user && com.userId == user.userId
        };
    });

    if(!req.body.commentbox){
        return res.status(400).render('rec_comments', {errors: "Comment cannot be empty", rec: {...r, comments: newcom}, user: user});
    }
    let comment = req.body.commentbox.trim();

    if(typeof(comment) != 'string' || comment.length == 0 || comment == ''){
        errors.push("Comment cannot be empty");
    }
    if(comment.length > 500){
        errors.push("Max length is 500 characters");
    }
    if(errors.length > 0){
        return res.status(400).render('rec_comments', {errors: errors.join(", "), rec: {...r, comments: newcom}, user: user});
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

    let com = { _id: new ObjectId(), name: `${user.firstName} ${user.lastName}`, userId: user.userId, comment: comment, date: date};

    r.comments.push(com);
    let rs = await rec_centers();
    await rs.updateOne({_id: r._id}, {$set: {comments: r.comments}});

    res.redirect(`/rec_centers/${r._id}/comments`);
});

router.route('/parks/:_id/comments/:comid/delete').post(async (req, res) => {
    let errors = [];
    let p = await getFacilityById(req.params._id);
    let comid = req.params.comid;
    let cind = p.comments.findIndex(c => c._id.toString() == comid);
    if(cind == -1){
        errors.push("Comment not found");
    }

    if(req.session.user == null){
        return res.redirect(`/parks/${p._id}/comments`)
    }
    let user = req.session.user;

    if(p.comments[cind].userId != user.userId){
        return res.status(400).render('park_comments', {errors: "You do not have access to delete this comment", park: p});
    }

    let newcom = p.comments.map(com => {
        return{
            ...com,
            commented: user && com.userId == user.userId
        };
    });

    if(errors.length > 0){
        return res.status(400).render('park_comments', {errors: errors.join(", "), park: {...p, comments: newcom}, user: user });
    }

    p.comments = p.comments.filter(p => p._id != comid);

    let ps = await parks();
    await ps.updateOne({_id: p._id}, {$set: {comments: p.comments}});

    res.redirect(`/parks/${p._id}/comments`);
});

router.route('/rec_centers/:_id/comments/:comid/delete').post(async (req, res) => {
    let errors = [];
    let r = await getFacilityById(req.params._id);
    let comid = req.params.comid;
    let cind = r.comments.findIndex(c => c._id.toString() == comid);
    if(cind == -1){
        errors.push("Comment not found");
    }

    if(req.session.user == null){
        return res.redirect(`/parks/${p._id}/comments`)
    }
    let user = req.session.user;

    if(r.comments[cind].userId != user.userId){
        return res.status(400).render('rec_comments', {errors: "You do not have access to delete this comment", rec: r, user: user});
    }

    let newcom = r.comments.map(com => {
        return{
            ...com,
            commented: user && com.userId == user.userId
        };
    });

    if(errors.length > 0){
        return res.status(400).render('rec_comments', {errors: errors.join(", "), rec: {...r, comments: newcom}, user: user});
    }

    r.comments = r.comments.filter(r => r._id != comid);

    let rs = await rec_centers();
    await rs.updateOne({_id: r._id}, {$set: {comments: r.comments}});

    res.redirect(`/rec_centers/${r._id}/comments`);
});

export default router;