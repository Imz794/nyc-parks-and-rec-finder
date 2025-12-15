import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
const saltRounds = 12;

function validatePasswordStrength(password) {
  if (typeof password !== 'string') {
    throw new Error("Password must be a string");
  }
  if (password.trim().length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (password.includes(' ')) {
    throw new Error("Password cannot contain spaces");
  }
  if (!/[A-Z]+/.test(password) || !/[0-9]+/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Password must contain an uppercase letter, a number, and a special character");
  }
}

export const register = async (
  firstName,
  lastName,
  userId,
  password,
  email,
  age,
  gender,
  role = "user"
) => {
  if (!firstName || !lastName || !userId || !password || !email || !age || !gender) {
    throw new Error("All fields must be supplied");
  }

  if (typeof firstName !== 'string') {
    throw new Error("First name must be a string");
  }
  if (!/^[A-Za-z]+$/.test(firstName)) {
    throw new Error("First name must only contain letters");
  }
  if (firstName.length < 2 || firstName.length > 20) {
    throw new Error("First name must be between 2 and 20 characters");
  }

  if (typeof lastName !== 'string') {
    throw new Error("Last name must be a string");
  }
  if (!/^[A-Za-z]+$/.test(lastName)) {
    throw new Error("Last name must only contain letters");
  }
  if (lastName.length < 2 || lastName.length > 20) {
    throw new Error("Last name must be between 2 and 20 characters");
  }

  if (typeof userId !== 'string') {
    throw new Error("User ID must be a string");
  }
  if (!/^[A-Za-z0-9]+$/.test(userId)) {
    throw new Error("User ID must only contain letters and positive whole numbers");
  }
  if (userId.length < 3 || userId.length > 12) {
    throw new Error("User ID must be between 3 and 12 characters");
  }
  userId = userId.toLowerCase();

  const user = await users();
  let ucheck = await user.findOne({ userId: userId });
  if (ucheck) {
    throw new Error('User ID already exists');
  }

  validatePasswordStrength(password);

  if (typeof email !== 'string') {
    throw new Error("Email must be a string");
  }
  if (email.trim().length === 0) {
    throw new Error("Email cannot be an empty string");
  }
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    throw new Error("Invalid email");
  }
  email = email.toLowerCase();

  age = Number(age);
  if (typeof age !== 'number' || age < 0 || !Number.isInteger(age) || age > 120) {
    throw new Error("Invalid age");
  }

  let date = new Date();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let year = date.getFullYear();
  month = String(month).padStart(2, '0');
  day = String(day).padStart(2, '0');
  year = String(year);
  let signupDate = `${month}/${day}/${year}`;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  let newu = {
    firstName: firstName,
    lastName: lastName,
    userId: userId,
    password: hashedPassword,
    email: email,
    age: age,
    gender: gender,
    role: "user",
    reviews: [],
    favorites: [],
    signupDate: signupDate
  };

  const insertInfo = await user.insertOne(newu);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error('There was an error adding the user');
  }

  return { registrationCompleted: true };
};

export const login = async (userId, password) => {
  if (!userId || !password) {
    throw new Error("All fields must be supplied");
  }

  if (typeof userId !== 'string') {
    throw new Error("User ID must be a string");
  }
  if (!/^[A-Za-z0-9]+$/.test(userId)) {
    throw new Error("User ID must only contain letters and positive whole numbers");
  }
  if (userId.length < 3 || userId.length > 12) {
    throw new Error("User ID must be between 3 and 12 characters");
  }
  userId = userId.toLowerCase();

  if (typeof password !== 'string') {
    throw new Error("Password must be a string");
  }
  if (password.trim().length === 0) {
    throw new Error("Password cannot be an empty string");
  }

  const user = await users();
  let ucheck = await user.findOne({ userId: userId });
  if (!ucheck) {
    throw new Error('Either the userId or password is invalid');
  } else {
    let temp = ucheck.password;
    let givpass = await bcrypt.compare(password, temp);
    if (!givpass) {
      throw new Error('Either the userId or password is invalid');
    } else {
      let date = new Date();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let year = date.getFullYear();
      let tfhour = date.getHours();
      let minute = date.getMinutes();
      let ap = 'AM';
      if (tfhour >= 12) {
        ap = 'PM';
        tfhour = tfhour - 12;
      }
      if (tfhour === 0) {
        tfhour = 12;
      }
      month = String(month).padStart(2, '0');
      day = String(day).padStart(2, '0');
      year = String(year);
      minute = String(minute).padStart(2, '0');
      tfhour = String(tfhour).padStart(2, '0');
      let ldate = `${month}/${day}/${year} ${tfhour}:${minute}${ap}`;
      ucheck.lastLogin = ldate;
      await user.updateOne(
        { userId: userId },
        { $set: { lastLogin: ldate } }
      );
    }

    let loggedin = {
      _id: ucheck._id,
      firstName: ucheck.firstName,
      lastName: ucheck.lastName,
      userId: ucheck.userId,
      age: ucheck.age,
      gender: ucheck.gender,
      email: ucheck.email,
      role: ucheck.role,
      signupDate: ucheck.signupDate,
      lastLogin: ucheck.lastLogin,
      reviews: ucheck.reviews,
      favorites: ucheck.favorites
    };
    return loggedin;
  }
};

export const getUserById = async (userId) => {
  if(!userId){
    throw new Error("Must provide user ID");
  }
  let user = await users();
  let ufind = await user.findOne({
    _id: userId
  });
  if(!ufind){
    throw new Error("User not found");
  }
  return ufind;
}
