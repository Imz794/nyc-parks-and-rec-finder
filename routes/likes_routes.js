import { Router } from 'express';
const router = Router();

import { parks, rec_centers } from '../config/mongoCollections.js';

async function toggleReaction(col, id, userId, action) {
  const likedField = 'likedBy';
  const dislikedField = 'dislikedBy';

  const doc = await col.findOne({ _id: id });
  if (!doc) throw new Error('Document not found');

  const likedBy = doc.likedBy || [];
  const dislikedBy = doc.dislikedBy || [];

  let update = {};
  let userReaction = 'none';

  if (action === 'like') {
    if (likedBy.map(String).includes(String(userId))) {
     
      update = { $pull: { [likedField]: String(userId) } };
      userReaction = 'none';
    } else {
      
      update = {
        $addToSet: { [likedField]: String(userId) },
        $pull: { [dislikedField]: String(userId) }
      };
      userReaction = 'like';
    }
  }

  if (action === 'dislike') {
    if (dislikedBy.map(String).includes(String(userId))) {
      
      update = { $pull: { [dislikedField]: String(userId) } };
      userReaction = 'none';
    } else {
      
      update = {
        $addToSet: { [dislikedField]: String(userId) },
        $pull: { [likedField]: String(userId) }
      };
      userReaction = 'dislike';
    }
  }

  await col.updateOne({ _id: id }, update);

  const updated = await col.findOne(
    { _id: id },
    { projection: { likedBy: 1, dislikedBy: 1 } }
  );

  const likes = updated.likedBy?.length || 0;
  const dislikes = updated.dislikedBy?.length || 0;

  await col.updateOne({ _id: id }, { $set: { likes, dislikes } });

  return { likes, dislikes, userReaction };
}

router.post('/parks/:_id/like', async (req, res) => {
    console.log('HIT parks like route', req.params._id);
  if (!req.session.user) return res.status(401).json({ error: 'You must be logged in.' });

  const id = parseInt(req.params._id, 10);
if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id.' });

  try {
    const col = await parks();
    const result = await toggleReaction(col, id, req.session.user.userId, 'like');
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});

router.post('/parks/:_id/dislike', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'You must be logged in.' });

  const id = parseInt(req.params._id, 10);
if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id.' });

  try {
    const col = await parks();
    const result = await toggleReaction(col, id, req.session.user.userId, 'dislike');
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});

router.post('/rec_centers/:_id/like', async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: 'You must be logged in.' });

  const id = (req.params._id || '').trim();
  if (!id) return res.status(400).json({ error: 'Invalid id.' });

  try {
    const col = await rec_centers();
    const result = await toggleReaction(col, id, req.session.user.userId, 'like');
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});

router.post('/rec_centers/:_id/dislike', async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: 'You must be logged in.' });

  const id = (req.params._id || '').trim();
  if (!id) return res.status(400).json({ error: 'Invalid id.' });

  try {
    const col = await rec_centers();
    const result = await toggleReaction(col, id, req.session.user.userId, 'dislike');
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});

export default router;