import {Router} from 'express';
const router = Router();
import { getHours, hasHours, parkList, recList } from '../data/parks_rec.js';
import { getFacilityById } from '../data/facilities.js';
import { searchFacilitiesByName } from '../data/facilities.js';


router.route('/rec_centers/:page').get(async (req, res) => {
    let page = parseInt(req.params.page, 10);
    if (isNaN(page) || page < 0) {
        return res.status(400).render('error', { error: 'Invalid page number', user: req.session.user });
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
        return res.status(400).render('error', { error: 'Invalid page number', user: req.session.user });
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

router.route('/rec_centers/:id/hours').get(async (req, res) => {
    let facilId = req.params.id;
    let facility = await getFacilityById(facilId);
    let hasH = false;
    let hours = {};

    if(!facility){
        return res.status(404).render('error', { error: 'Facility not found', user: req.session.user });
    }

    if(hasHours(facility)){
        hasH = true;
        hours = getHours(facility);
    }

    res.render('hours', { facility: facility, hasHours: hasH, hours: hours, user: req.session.user });
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

router.route('/parks/info/:id').get(async (req, res) => {
    let facilId = req.params.id;
    let facility = await getFacilityById(facilId);

    if(!facility){
        return res.status(404).render('error', { error: 'Facility not found', user: req.session.user });
    }

    res.render('one_park', { park: facility, user: req.session.user });
});

router.route('/rec_centers/info/:id').get(async (req, res) => {
    let facilId = req.params.id;
    let facility = await getFacilityById(facilId);
    let hasH = false;
    let hours = {};

    if(!facility){
        return res.status(404).render('error', { error: 'Facility not found', user: req.session.user });
    }

    if(hasHours(facility)){
        hasH = true;
        hours = getHours(facility);
    }

    res.render('one_rec', { rec: facility, hasHours: hasH, hours: hours, user: req.session.user });
});

export default router;