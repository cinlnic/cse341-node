const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 5000;
const cors = require('cors')
const mongoose = require('mongoose');
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

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

const MONGOODB_URL = process.env.MONGOODB_URL || "mongodb+srv://cse341-node:jbiD2LdjtBdQrKr6@cluster0.lxabu.mongodb.net/shop?retryWrites=true&w=majority";

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { getMaxListeners } = require('process');

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("615b71318d56080a52a0251a")
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGOODB_URL, options)
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    username: 'Cindi',
                    email: 'cindi@gmail.com',
                    cart: {
                        items: []
                    }
                });
                 user.save();
             }   
        });
       app.listen(PORT); 
    })
    .catch(err => {
        console.log(err);
    });
