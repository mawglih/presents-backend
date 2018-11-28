const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Podarok = require('../../models/Podarok');
router.get('/test', (req, res) => res.json({ msg: "podarki work"}));

//validation
const validatePodarokInput = require('../../validation/podarok');
// create podarok entry

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePodarokInput(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }
  const newPodarok = new Podarok({
    title: req.body.title,
    image: req.body.image,
    description: req.body.description,
    url: req.body.url,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id,
  });
  newPodarok.save().then(podarok => res.json(podarok));
});

module.exports = router;
