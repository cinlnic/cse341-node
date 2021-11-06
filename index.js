const path = require('path');
const express = require('express');

const cors = require('cors')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://cse341-node:jbiD2LdjtBdQrKr6@cluster0.lxabu.mongodb.net/shop"
const csrfProtection = csrf();
const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions'
});

const corsOptions = {
    origin: "https://cse341-node-project.herokuapp.com/",
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    family: 4
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { getMaxListeners } = require('process');

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
    session({
        secret: 'my secret', 
        resave: false, 
        saveUninitialized: false,
        store: store
    })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user)  {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
           next(new Error(err));
        });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.redirect('/500');
    console.log(error);
});

mongoose
    .connect(MONGODB_URL, options)
    .then(result => {
       app.listen(PORT); 
    })
    .catch(err => {
        console.log(err);
    });
