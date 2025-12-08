import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
}));


app.use('/login', async (req, res, next) => {
    if(req.session.user){
    return res.redirect('/profile');
    }
    next();
});

app.use('/register', async (req, res, next) => {
    if(req.session.user){
    return res.redirect('/profile');
    }
    next();
});

app.use('/profile', async (req, res, next) => {
    if(req.session.user == null){
        return res.redirect('/login');
    }
    next();
});

app.use('/signout', async (req, res, next) => {
     if(req.session.user == null){
          return res.redirect('/login');
     }
     next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});