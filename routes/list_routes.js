import {Router} from 'express';
const router = Router();
import { parkList, recList } from '../data/parks_rec.js';
import { getFacilityById, hasReviewed } from '../data/facilities.js';
import { searchFacilitiesByName } from '../data/facilities.js';
import { parks, rec_centers } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

router.route('/rec_centers/:page').get(async (req, res) => {
    let page = parseInt(req.params.page, 10);
    if (isNaN(page) || page < 0) {
        return res.status(400).render('error', { error: 'Invalid page number' });
    }

    let back = page > 0 ? page - 1 : 0;
    let next = page + 1;

    const recL = await recList(page);
    let comments = recL.map(r => r.comments = r.comments.slice(0, 3));
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

router.route('/search').get(async (req, res) => {
    const query = req.query.query;

    let results = [];
    let error = null;

    if (query && query.trim().length > 0) {
        try {
            results = await searchFacilitiesByName(query.trim(), 0, 20);
        } catch (e) {
            error = e.toString();
        }
    }

    res.render('search', {
        query,
        results,
        error,
        user: req.session.user
    });
});

export default router;