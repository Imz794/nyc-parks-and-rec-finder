(() => {
  function isBlank(val) {
    return !val || val.trim().length === 0;
  }

  function getInt(val) {
    const n = Number(val);
    return Number.isInteger(n) ? n : NaN;
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function removeExistingError(el) {
    el.classList.remove('error');
    const next = el.nextElementSibling;
    if (next && next.classList.contains('error-message')) {
      next.remove();
    }
  }

  function showError(el, msg) {
    el.classList.add('error');

    const next = el.nextElementSibling;
    if (next && next.classList.contains('error-message')) {
      next.textContent = msg;
      return;
    }

    const p = document.createElement('p');
    p.className = 'error-message';
    p.textContent = msg;
    el.insertAdjacentElement('afterend', p);
  }

  function clearFormErrors(form) {
    const errs = form.querySelectorAll('.error-message');
    errs.forEach(e => e.remove());
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(i => i.classList.remove('error'));
  }

  function validateLogin(form) {
    let ok = true;

    const userId = form.querySelector('[name="userId"]');
    const password = form.querySelector('[name="password"]');

    removeExistingError(userId);
    removeExistingError(password);

    if (!userId || isBlank(userId.value)) {
      showError(userId, 'User ID is required.');
      ok = false;
    }

    if (!password || isBlank(password.value)) {
      showError(password, 'Password is required.');
      ok = false;
    }

    return ok;
  }

  function validateRegister(form) {
    let ok = true;

    const firstName = form.querySelector('[name="firstName"]');
    const lastName = form.querySelector('[name="lastName"]');
    const userId = form.querySelector('[name="userId"]');
    const email = form.querySelector('[name="email"]');
    const password = form.querySelector('[name="password"]');
    const confirmPassword = form.querySelector('[name="confirmPassword"]');
    const gender = form.querySelector('[name="gender"]');
    const age = form.querySelector('[name="age"]');

    const fields = [firstName, lastName, userId, email, password, confirmPassword, gender, age].filter(Boolean);
    fields.forEach(removeExistingError);

    if (!firstName || isBlank(firstName.value)) { showError(firstName, 'First name is required.'); ok = false; }
    if (!lastName || isBlank(lastName.value)) { showError(lastName, 'Last name is required.'); ok = false; }
    if (!userId || isBlank(userId.value)) { showError(userId, 'User ID is required.'); ok = false; }

    if (!email || isBlank(email.value)) {
      showError(email, 'Email is required.');
      ok = false;
    } else if (!validEmail(email.value)) {
      showError(email, 'Email format is invalid.');
      ok = false;
    }

    if (!password || isBlank(password.value)) {
      showError(password, 'Password is required.');
      ok = false;
    } else if (password.value.length < 8) {
      showError(password, 'Password must be at least 8 characters.');
      ok = false;
    }

    if (!confirmPassword || isBlank(confirmPassword.value)) {
      showError(confirmPassword, 'Confirm password is required.');
      ok = false;
    } else if (password && confirmPassword.value !== password.value) {
      showError(confirmPassword, 'Passwords do not match.');
      ok = false;
    }

    if (!gender || isBlank(gender.value)) {
      showError(gender, 'Please select a gender.');
      ok = false;
    }

    if (!age || isBlank(age.value)) {
      showError(age, 'Age is required.');
      ok = false;
    } else {
      const n = getInt(age.value);
      if (Number.isNaN(n)) {
        showError(age, 'Age must be an integer.');
        ok = false;
      } else if (n < 0 || n > 120) {
        showError(age, 'Age must be between 0 and 120.');
        ok = false;
      }
    }

    return ok;
  }

  function validateComment(form) {
    let ok = true;
    const comment = form.querySelector('[name="commentbox"]');
    if (!comment) return true;

    removeExistingError(comment);

    const v = (comment.value || '').trim();
    if (v.length === 0) {
      showError(comment, 'Comment is required.');
      ok = false;
    } else if (v.length > 1000) {
      showError(comment, 'Comment is too long (max 1000).');
      ok = false;
    }

    return ok;
  }

  function validateReview(form) {
    let ok = true;

    const title = form.querySelector('[name="reviewtitle"]');
    const desc = form.querySelector('[name="reviewbox"]');
    const rating = form.querySelector('[name="rating"]');

    [title, desc, rating].filter(Boolean).forEach(removeExistingError);

    const t = (title?.value || '').trim();
    const d = (desc?.value || '').trim();

    if (!title || t.length === 0) { showError(title, 'Review title is required.'); ok = false; }
    else if (t.length > 200) { showError(title, 'Review title is too long (max 200).'); ok = false; }

    if (!desc || d.length === 0) { showError(desc, 'Description is required.'); ok = false; }
    else if (d.length > 2000) { showError(desc, 'Description is too long (max 2000).'); ok = false; }

    if (!rating || isBlank(rating.value)) {
      showError(rating, 'Rating is required.');
      ok = false;
    } else {
      const n = getInt(rating.value);
      if (Number.isNaN(n)) {
        showError(rating, 'Rating must be an integer.');
        ok = false;
      } else if (n < 1 || n > 5) {
        showError(rating, 'Rating must be between 1 and 5.');
        ok = false;
      }
    }

    return ok;
  }

  function classifyForm(form) {
    const id = form.getAttribute('id') || '';
    const action = (form.getAttribute('action') || '').toLowerCase();

    if (id === 'signin-form' || action === '/login') return 'login';
    if (id === 'signup-form' || action === '/register') return 'register';

    // comments / rating forms
    if (action.includes('/comments')) return 'comment';
    if (action.includes('/rating')) return 'review';

    return 'other';
  }

  function attachValidation(form) {
    form.addEventListener('submit', (e) => {
      clearFormErrors(form);

      const type = classifyForm(form);
      let ok = true;

      if (type === 'login') ok = validateLogin(form);
      else if (type === 'register') ok = validateRegister(form);
      else if (type === 'comment') ok = validateComment(form);
      else if (type === 'review') ok = validateReview(form);

      if (!ok) {
        e.preventDefault();
        
        const firstErr = form.querySelector('.error');
        if (firstErr) firstErr.focus();
        return;
      }

    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(f => attachValidation(f));
  });
})();
