'use strict';

const express = require('express');
const config = require('../config');
const passport = require('passport');

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');


const router = express.Router();

const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());

// The user provides a username and password to login
router.post('/login', localAuth, (req, res) => {
  console.log(req.body);
  const authToken = createAuthToken(req.user.serialize());
  var myObj = {token: authToken, user:req.user};
  //res.json({authToken});
  res.json(myObj);
});

const jwtAuth = passport.authenticate('jwt', {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  var myobj = {token:authToken, user:req.user};
  res.json(myobj);
});

module.exports = {router};