import express from 'express';
import exphbs from 'express-handlebars';
import session from 'express-session';
import configRoutes from './routes/index.js';

const app = express();

app.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: 'main',
    partialsDir: ['views/partials/']
  })
);
app.set('view engine', 'handlebars');

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: 'AuthenticationState',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true
    }
  })
);

app.use('/login', (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  next();
});

app.use('/register', (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  next();
});

app.use('/profile', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
});

app.use('/signout', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
});

configRoutes(app);

app.use('*', (req, res) => {
  res.status(404).render('error', { error: 'Page not found' });
});

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
