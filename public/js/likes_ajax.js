function showErr(container, msg) {
  if (!container) return;
  container.textContent = msg;
  container.hidden = false;
}

function clearErr(container) {
  if (!container) return;
  container.textContent = '';
  container.hidden = true;
}

async function sendToggle(kind, id, action) {
  const url =
    kind === 'park'
      ? `/parks/${id}/${action}`
      : `/rec_centers/${id}/${action}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin'
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

document.addEventListener('click', async (e) => {
  const likeBtn = e.target.closest('.like-btn');
  const dislikeBtn = e.target.closest('.dislike-btn');
  if (!likeBtn && !dislikeBtn) return;

  const btn = likeBtn || dislikeBtn;
  const card = btn.closest('article');
  const errP = card ? card.querySelector('.ajax-error') : null;
  clearErr(errP);

  const id = btn.dataset.id;
  const kind = btn.dataset.kind;
  const action = likeBtn ? 'like' : 'dislike';

  try {
    const data = await sendToggle(kind, id, action);

    const likeCount = card.querySelector('.like-count');
    const dislikeCount = card.querySelector('.dislike-count');
    if (likeCount) likeCount.textContent = data.likes;
    if (dislikeCount) dislikeCount.textContent = data.dislikes;
  } catch (err) {
    showErr(errP, err.message || 'Error');
  }
});