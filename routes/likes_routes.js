import { Router } from 'express';
const router = Router();

import { parks, rec_centers } from '../config/mongoCollections.js';

async function toggleReaction(col, id, userId, action) {
  const likedField = 'likedBy';
  const dislikedField = 'dislikedBy';

  await col.updateOne(
    { _id: id, [likedField]: { $exists: false } },
    { $set: { [likedField]: [] } }
  );
  await col.updateOne(
    { _id: id, [dislikedField]: { $exists: false } },
    { $set: { [dislikedField]: [] } }
  );

  if (action === 'like') {
    await col.updateOne(
      { _id: id },
      { $pull: { [dislikedField]: userId }, $addToSet: { [likedField]: userId } }
    );
  } else {
    await col.updateOne(
      { _id: id },
      { $pull: { [likedField]: userId }, $addToSet: { [dislikedField]: userId } }
    );
  }

  const updated = await col.findOne(
    { _id: id },
    { projection: { likedBy: 1, dislikedBy: 1 } }
  );

  const likes = updated?.likedBy?.length ?? 0;
  const dislikes = updated?.dislikedBy?.length ?? 0;

  await col.updateOne({ _id: id }, { $set: { likes, dislikes } });

  return { likes, dislikes };
}

router.post('/parks/:_id/like', async (req, res) => {
    console.log('HIT parks like route', req.params._id);
  if (!req.session.user) return res.status(401).json({ error: 'You must be logged in.' });

  const id = Number(req.params._id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid park id.' });

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

  const id = Number(req.params._id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid park id.' });

  try {
    const col = await parks();
    const result = await toggleReaction(col, id, req.session.user.userId, 'dislike');
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});

router.post('/rec_centers/:_id/like', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'You must be logged in.' });

  const id = Number(req.params._id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid rec center id.' });

  try {
    const col = await rec_centers();
    const result = await toggleReaction(col, id, req.session.user.userId, 'like');
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});

router.post('/rec_centers/:_id/dislike', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'You must be logged in.' });

  const id = Number(req.params._id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid rec center id.' });

  try {
    const col = await rec_centers();
    const result = await toggleReaction(col, id, req.session.user.userId, 'dislike');
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});

export default router;