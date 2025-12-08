import {Router} from 'express';
const router = Router();
import { login, register } from '../data/users.js';

router.route('/').get(async (req, res) => {
  let usere = true;
  if(req.session.user == null){
    usere = false;
  }
  res.render('home', {user: req.session.user, usere: usere});
});

router
  .route('/register')
  .get(async (req, res) => {
    res.render('register');
  })
  .post(async (req, res) => {
    let errors = [];
    if(!req.body.firstName){
      errors.push("Must supply a first name");
    }
    let firstName = req.body.firstName;
    if(!req.body.lastName){
      errors.push("Must supply a last name");
    }
    let lastName = req.body.lastName;
    if(!req.body.userId){
      errors.push("Must supply a user ID");
    }
    let userId = req.body.userId;
    if(!req.body.email){
      errors.push("Must supply an email");
    }
    let email = req.body.email;
    if(!req.body.password){
      errors.push("Must supply a password");
    }
    let password = req.body.password;
    if(!req.body.confirmPassword){
      errors.push("Must supply a confirm password");
    }
    let confirmPassword = req.body.confirmPassword;
    if(!req.body.gender){
      errors.push("Must supply a gender");
    }
    let gender = req.body.gender;
    if(!req.body.age){
      errors.push("Must supply an age");
    }
    let age = req.body.age;
  
    if(errors.length > 0){
      return res.status(400).render('register', {errors: errors})
    }

    if(!/^[A-Za-z]+$/.test(firstName)){
      errors.push("First name must only contain letters");
    }
    if(firstName.length < 2 || firstName.length > 20){
      errors.push("First name must be between 2 and 20 characters");
    }

    if(!/^[A-Za-z]+$/.test(lastName)){
      errors.push("Last name must only contain letters");
    }
    if(lastName.length < 2 || lastName.length > 20){
      errors.push("Last name must be between 2 and 20 characters");
    }

    if(!/^[A-Za-z0-9]+$/.test(userId)){
      errors.push("User ID must only contain letters and positive whole numbers");
    }
    if(userId.length < 3 || userId.length > 12){
      errors.push("User ID must be between 3 and 12 characters");
    }
    userId = userId.toLowerCase();

    if(password.trim().length < 8){
      errors.push("Password must be at least 8 characters");
    }
    if(password.includes(' ')){
      errors.push("Password cannot contain spaces");
    }
    if(!/[A-Z]+/.test(password)){
      errors.push("Password must contain an uppercase letter, a number, and a special character");
    }
    else if(!/[0-9]+/.test(password)){
      errors.push("Password must contain an uppercase letter, a number, and a special character");
    }
    else if(!/[^A-Za-z0-9]/.test(password)){
      errors.push("Password must contain an uppercase letter, a number, and a special character");
    }
    if(password !== confirmPassword){
      errors.push("Password and confirm password must be the same");
    }

    if(!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)){
      errors.push("Invalid email");
    }
    email = email.toLowerCase();

    age = Number(age);
    if(typeof(age) != 'number' || age < 0 || !Number.isInteger(age) || age > 120){
        errors.push("Invalid age");
    }

    if(errors.length > 0){
      return res.status(400).render('register', {errors: errors})
    }
    try{
      let reg = await register(firstName, lastName, userId, password, email, age, gender);
      if(reg && reg.registrationCompleted){
        res.redirect('/');
      }
      else{
        return res.status(500).render('register', {errors: ["Internal Server Error"]})
      }
    }
    catch(e){
      errors.push(e.message);
    }
    if(errors.length > 0){
      return res.status(400).render('register', {errors: errors});
    }
  });

router
  .route('/login')
  .get(async (req, res) => {
    res.render('login');
  })
  .post(async (req, res) => {
    let errors = [];

    if(!req.body.userId){
      errors.push("Must supply a user ID");
    }
    let userId = req.body.userId;
    if(!req.body.password){
      errors.push("Must supply a password");
    }
    let password = req.body.password;

    if(errors.length > 0){
      return res.status(400).render('login', {errors: errors});
    }

    if(typeof(userId) != 'string'){
      errors.push("User ID must be a string");
    }
    if(!/^[A-Za-z0-9]+$/.test(userId)){
      errors.push("User ID must only contain letters and positive whole numbers");
    }
    if(userId.length < 3 || userId.length > 12){
      errors.push("User ID must be between 3 and 12 characters");
    }
    userId = userId.toLowerCase();

    if(typeof(password) != 'string'){
      errors.push("Password must be a string");
    }
    if(password.trim().length < 8){
      errors.push("Password must be at least 8 characters");
    }
    if(password.includes(' ')){
      errors.push("Password cannot contain spaces");
    }
    if(!/[A-Z]+/.test(password)){
      errors.push("Password must contain an uppercase letter, a number, and a special character");
    }
    else if(!/[0-9]+/.test(password)){
      errors.push("Password must contain an uppercase letter, a number, and a special character");
    }
    else if(!/[^A-Za-z0-9]/.test(password)){
      errors.push("Password must contain an uppercase letter, a number, and a special character");
    }

    if(errors.length > 0){
      return res.status(400).render('login', {errors: errors});
    }

    let li;
    try{
      li = await login(userId, password);
    }
    catch(e){
      errors.push(e.message);
    }
    if(errors.length > 0){
      return res.status(400).render('login', {errors: errors});
    }
    req.session.user = {
      firstName: li.firstName,
      lastName: li.lastName,
      userId: userId,
      email: li.email,
      gender: li.gender,
      age: li.age,
      signupDate: li.signupDate,
      lastLogin: li.lastLogin
    };

    res.redirect('/');
  });

router.route('/profile').get(async (req, res) => {
    //   firstName = req.session.user.firstName;
    //   lastName = req.session.user.lastName;
    //   role = req.session.user.role;
    //   signupDate = req.session.user.signupDate;
    //   lastLogin = req.session.user.lastLogin;
    //   favoriteQuote = req.session.user.favoriteQuote;

    //   let date = new Date();
    //   let month = date.getMonth() + 1;
    //   let day = date.getDate();
    //   let year = date.getFullYear();
    //   let tfhour = date.getHours();
    //   let minute = date.getMinutes();
    //   let ap = 'AM';
    //   if(tfhour >= 12){
    //     ap = 'PM';
    //     tfhour = tfhour - 12;
    //   }
    //   if(tfhour == 0){
    //     tfhour = 12;
    //   }
    //   month = String(month).padStart(2, '0');
    //   day = String(day).padStart(2, '0');
    //   year = String(year);
    //   minute = String(minute).padStart(2, '0');
    //   tfhour = String(tfhour).padStart(2, '0');
    //   currentDate = `${month}/${day}/${year}`;
    //   currentTime = `${tfhour}:${minute}${ap}`;
    res.render('profile', {user: req.session.user});
  });

// router.route('/superuser').get(async (req, res) => {
//   //code here for GET
//   let firstName, lastName, role, signupDate, lastLogin, favoriteQuote, currentTime, currentDate;

//   if(req.session.user){
//       firstName = req.session.user.firstName;
//       lastName = req.session.user.lastName;
//       role = req.session.user.role;
//       signupDate = req.session.user.signupDate;
//       lastLogin = req.session.user.lastLogin;
//       favoriteQuote = req.session.user.favoriteQuote;

//       let date = new Date();
//       let month = date.getMonth() + 1;
//       let day = date.getDate();
//       let year = date.getFullYear();
//       let tfhour = date.getHours();
//       let minute = date.getMinutes();
//       let ap = 'AM';
//       if(tfhour >= 12){
//         ap = 'PM';
//         tfhour = tfhour - 12;
//       }
//       if(tfhour == 0){
//         tfhour = 12;
//       }
//       month = String(month).padStart(2, '0');
//       day = String(day).padStart(2, '0');
//       year = String(year);
//       minute = String(minute).padStart(2, '0');
//       tfhour = String(tfhour).padStart(2, '0');
//       currentDate = `${month}/${day}/${year}`;
//       currentTime = `${tfhour}:${minute}${ap}`;
//   }
//   res.render('superuser', {user: req.session.user, firstName: firstName, lastName: lastName, role: role, signupDate: signupDate, lastLogin: lastLogin, favoriteQuote: favoriteQuote, currentDate: currentDate, currentTime: currentTime});
// });

router.route('/signout').get(async (req, res) => {
  req.session.destroy();
  res.render('signout');
});

export default router;