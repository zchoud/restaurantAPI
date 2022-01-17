//default express dependencies using express-generator
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var { check, validationResult } = require('express-validator');
var app = express();
//assignment additions
var cors = require('cors');
var RestaurantDB = require('./modules/restaurantDB');
const { query } = require('express');
const db = new RestaurantDB();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

//get routes
app.get('/', function(req, res) {
    res.send({ message: "API Listening" });
});
app.get('/api/restaurants', [
        //checking if each query is of its correct type and is not empty
        check('page').notEmpty().isNumeric(),
        check('perPage').notEmpty().isNumeric()
    ],
    (req, res) => {
        //check if errors ocurred
        const queryErrors = validationResult(req);
        //if the error check is not an empty set display as a json the errors with error code of 500
        if (!queryErrors.isEmpty()) {
            res.status(500).send(res.json(queryErrors));
        } else {
            let page = req.query.page;
            let perPage = req.query.perPage;
            let borough = req.query.borough ? req.query.borough : "";
            db.getAllRestaurants(page, perPage, borough).then(result => {
                res.json(result);
            }).catch(error => {
                res.status(500).send(error);
            })
        };
    });
app.get('/api/restaurants/:id', (req, res) => {
    db.getRestaurantById(req.params.id).then(result => {
        res.json(result);
    }).catch(error => {
        res.status(500).send(error);
    });
});

//post route
app.post('api/restaurants', (req, res) => {
    db.addNewRestaurant(req.body)
        .then(res.send("added user"))
        .catch(error => {
            console.log(error);
            res.status(500);
        });
});

//put route
app.put('api/restaurants/:id', (req, res) => {
    db.updateRestaurantById(req.body, id).then(res.send("updated user"))
        .catch(error => console.log(error));
});

//delete route
app.delete('api/restaurants/:id', (req, res) => {
    db.deleteRestaurantById(id).then(res.send("deleted user"))
        .catch(error => console.log(error));
});

let HTTP_PORT = 8080;
db.initialize("mongodb+srv://zchoudhury:myseneca@app.rt191.mongodb.net/sample_restaurants?retryWrites=true&w=majority").then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err) => {
    console.log(err);
});

module.exports = app;