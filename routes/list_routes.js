import {Router} from 'express';
const router = Router();
import { parkList, recList } from '../data/parks_rec.js';

router.route('/rec_centers/:page').get(async (req, res) => {
    let page, back, next;
    if(req.params.page){
        page = req.params.page;
    }
    else{
        page = 0;
    }
    if(page > 0){
        back = Number(page) - 1;
        next = Number(page) + 1;
    }
    else{
        back = 0;
        next = 1;
    }
    const recL = await recList(page);
    res.render('recs', {recs: recL, next: next, back: back});
});

router.route('/rec_centers').get(async (req, res) => {
    res.redirect('/rec_centers/0');
});

router.route('/parks/:page').get(async (req, res) => {
    let page, back, next;
    if(req.params.page){
        page = req.params.page;
    }
    else{
        page = 0;
    }
    if(page > 0){
        back = Number(page) - 1;
        next = Number(page) + 1;
    }
    else{
        back = 0;
        next = 1;
    }
    const parkL = await parkList(page);
    res.render('parks', {parks: parkL, next: next, back: back});
});

router.route('/parks').get(async (req, res) => {
    res.redirect('/parks/0');
});

export default router;