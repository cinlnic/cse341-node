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

const MONGOODB_URL = process.env.MONGOODB_URL;
const csrfProtection = csrf();
const app = express();

const store = new MongoDBStore({
    uri: MONGOODB_URL,
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
        req.user = user;
        next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGOODB_URL, options)
    .then(result => {
       app.listen(PORT); 
    })
    .catch(err => {
        console.log(err);
    });
