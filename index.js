const path = require('path');

const express = require('express');
const PORT = process.env.PORT || 5000;

const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

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
    .connect('mongodb+srv://cse341-node:jbiD2LdjtBdQrKr6@cluster0.lxabu.mongodb.net/shop?retryWrites=true&w=majority')
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
       app.listen(5000); 
    })
    .catch(err => {
        console.log(err);
    });
