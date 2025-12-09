import {Router} from 'express';
const router = Router();
import { parkList, recList } from '../data/parks_rec.js';

router.route('/rec_centers/:page').get(async (req, res) => {
  let page = parseInt(req.params.page, 10);
  if (isNaN(page) || page < 0) {
    return res.status(400).render('error', { error: 'Invalid page number' });
  }

  let back = page > 0 ? page - 1 : 0;
  let next = page + 1;

  const recL = await recList(page);
  res.render('recs', { recs: recL, next: next, back: back, user: req.session.user });
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
  res.render('parks', { parks: parkL, next, back, user: req.session.user });
});

router.route('/parks').get(async (req, res) => {
    res.redirect('/parks/0');
});

export default router;