import { Router } from 'express';
import { register, login } from '../data/users.js';

const router = Router();

router.route('/').get(async (req, res) => {
  try {
    return res.render('home', { user: req.session.user });
  } catch (e) {
    return res.status(500).render('error', { error: 'Internal Server Error' });
  }
});

router
  .route('/register')
  .get(async (req, res) => {
    return res.render('register', { user: req.session.user });
  })
  .post(async (req, res) => {
    const errors = [];
    let {
      firstName,
      lastName,
      userId,
      email,
      password,
      confirmPassword,
      gender,
      age
    } = req.body;

    if (!firstName) errors.push('First name is required');
    if (!lastName) errors.push('Last name is required');
    if (!userId) errors.push('User ID is required');
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    if (!confirmPassword) errors.push('Confirm Password is required');
    if (!gender) errors.push('Gender is required');
    if (!age) errors.push('Age is required');

    if (errors.length > 0) {
      return res.status(400).render('register', {
        errors,
        user: req.session.user
      });
    }

    firstName = firstName.trim();
    lastName = lastName.trim();
    userId = userId.trim();
    email = email.trim();
    age = age.toString().trim();

    if (typeof firstName !== 'string' || firstName.length < 2 || firstName.length > 20) {
      errors.push('First name must be a string between 2 and 20 characters');
    }
    if (!/^[A-Za-z]+$/.test(firstName)) {
      errors.push('First name must only contain letters');
    }

    if (typeof lastName !== 'string' || lastName.length < 2 || lastName.length > 20) {
      errors.push('Last name must be a string between 2 and 20 characters');
    }
    if (!/^[A-Za-z]+$/.test(lastName)) {
      errors.push('Last name must only contain letters');
    }

    if (typeof userId !== 'string' || userId.length < 3 || userId.length > 12) {
      errors.push('User ID must be between 3 and 12 characters');
    }
    if (!/^[A-Za-z0-9]+$/.test(userId)) {
      errors.push('User ID must only contain letters and numbers');
    }

    if (typeof email !== 'string' || email.length === 0) {
      errors.push('Email must be a non-empty string');
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      errors.push('Invalid email format');
    }

    if (password !== confirmPassword) {
      errors.push('Password and Confirm Password do not match');
    }

    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 120) {
      errors.push('Age must be an integer between 0 and 120');
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      errors.push('Invalid gender value');
    }

    if (errors.length > 0) {
      return res.status(400).render('register', {
        errors,
        user: req.session.user
      });
    }
    
    try {
      await register(firstName, lastName, userId, password, email, ageNum, gender, 'user');
      return res.redirect('/login');
    } catch (e) {
      errors.push(e.message || 'Failed to register user');
      return res.status(400).render('register', {
        errors,
        user: req.session.user
      });
    }
  });

router
  .route('/login')
  .get(async (req, res) => {
    return res.render('login', { user: req.session.user });
  })
  .post(async (req, res) => {
    const errors = [];
    let { userId, password } = req.body;

    if (!userId) {
      errors.push('Must supply a user ID');
    }
    if (!password) {
      errors.push('Must supply a password');
    }

    if (errors.length > 0) {
      return res.status(400).render('login', { errors, user: req.session.user });
    }

    if (typeof userId !== 'string') {
      errors.push('User ID must be a string');
    } else {
      userId = userId.trim();
      if (!/^[A-Za-z0-9]+$/.test(userId)) {
        errors.push('User ID must only contain letters and positive whole numbers');
      }
      if (userId.length < 3 || userId.length > 12) {
        errors.push('User ID must be between 3 and 12 characters');
      }
      userId = userId.toLowerCase();
    }

    if (typeof password !== 'string') {
      errors.push('Password must be a string');
    } else if (password.trim().length === 0) {
      errors.push('Password cannot be an empty string');
    }

    if (errors.length > 0) {
      return res.status(400).render('login', { errors, user: req.session.user });
    }

    try {
      const li = await login(userId, password);

      req.session.user = {
        _id: li._id,
        firstName: li.firstName,
        lastName: li.lastName,
        userId: li.userId,
        email: li.email,
        gender: li.gender,
        age: li.age,
        signupDate: li.signupDate,
        lastLogin: li.lastLogin,
        reviews: li.reviews,
        favorites: li.favorites
      };

      return res.redirect('/');
    } catch (e) {
      errors.push(e.message || 'Either the userId or password is invalid');
      return res.status(400).render('login', { errors, user: req.session.user });
    }
  });

router.route('/profile').get(async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  return res.render('profile', {
    user: req.session.user
  });
});

router.route('/signout').get(async (req, res) => {
  req.session.destroy(() => {
    return res.render('signout');
  });

router.route('/become-admin').get(async (req,res) => 
  {
    if(!.req.session.user) 
    {
      return res.redirect('/login';
    }
    return res.render('become_admin', { user: req.session.user });
  })
  .post(async (req,res) => {
    if(!req.session.user)
    {
      return res.redirect('/login');
    }

    const { adminKey } = req.body;

    if (!adminkey || adminkey !== ADMIN_KEY) 
    {
        return res.status(400).render('become_admin', {
        user: req.session.user,
        errors: ["Invalid admin key."]
      });
    }

    try {
      // Upgrade the user role to admin
      const { users } = await import('../config/mongoCollections.js'); // your users collection
      const userCollection = await users();
      await userCollection.updateOne(
        { userId: req.session.user.userId },
        { $set: { role: "admin" } }
      );

      // Update session
      req.session.user.role = "admin";

      return res.render('become_admin', {
        user: req.session.user,
        success: "You are now an admin!"
      });
    } catch (e) {
      return res.status(500).render('become_admin', {
        user: req.session.user,
        errors: [e.message]
      });
    }   
});

export default router;
