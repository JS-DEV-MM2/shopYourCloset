'use strict'

// import dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const cors = require('cors');

// configure mongoose to use ES6 promises
mongoose.Promise = global.Promise;

//const bodyParser = require('body-parser');

const {PORT, DATABASE_URL} = require('./config');

// import modules
const {router: usersRouter } = require('./users');
const {router: idealclosetRouter} = require('./idealcloset');
const {router: myclosetRouter} = require('./mycloset');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

//app.use(express.json());

// declare new app instance
const app = express();

// log all requests
app.use(morgan('common'));

app.use(express.json());

// enable CORS
app.use(cors());

// enable use of passport authentication strategies
passport.use(localStrategy);
passport.use(jwtStrategy);

/*
// enable CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods'), 'GET, POST, PUT, PATCH, DELETE';
    if (req.method === 'OPTIONS') {
        return res.send(204);
    }
    next();
});
*/

// serve static files from public folder
app.use(express.static('public'));

// public routers
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);


// protected routers
app.use('/api/idealcloset/', idealclosetRouter);
app.use('/api/mycloset/', myclosetRouter);

//const jwtAuth = passport.authenticate('jwt', {session: false});



// use this JWT strategy to protect endpoints:
//app.get('/getUserInformation', jwtAuth, (req,res) => {
//        return res.json({
//            data: 'rosebud'
//        });
//});

// catch all handler if route does not exist
app.use('*', (req, res) => {
    return res.status(404).json({ message: 'URL not found.'});
});

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve,reject) => {
        mongoose.connect(databaseUrl, err => {
            if(err) {
                return reject(err);
            }
            server = app
                .listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
            });
        });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if(err) {
                    return reject(err);
                }
                resolve();
            })
        })
    })
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};