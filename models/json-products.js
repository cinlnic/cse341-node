const fetch = require('node-fetch');
const JsonUrl = 'https://byui-cse.github.io/cse341-course/lesson03/items.json';

module.exports = class JSONProducts {
    static fetchAll(data) {
        fetch(JsonUrl)
            .then((res) => res.json())
            .then((products) => {
                data(products);
            })
            .catch((err) => console.log(err));
    }
};

