const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Podarok = require('../../models/Podarok');
const Profile = require('../../models/Profile');
//validation
const validatePodarokInput = require('../../validation/podarok');
const validateCommentInput = require('../../validation/comment');

router.get('/test', (req, res) => res.json({ msg: "podarki work"}));

//get
router.get('/', (req, res) => {
  Podarok.find()
    .sort({ at: -1 })
    .then(podarok => res.json(podarok))
    .catch(err => res.status(404).json({ nopodarok: 'No podarki found'}));
});

//single
router.get('/:id', (req, res) => {
  Podarok.findById(req.params.id)
    .then(podarok => res.json(podarok))
    .catch(err => res.status(404).json({ nopodarok: 'There is no podarok with thnat id' }));
});

// four one user
router.get('/user/:user_id', (req, res) => {
  Podarok.find({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(podarok => {
      if(!podarok) {
        errors.nopodarok = 'This user does not have any presents yet';
        res.status(403).json(errors);
      }
      res.json(podarok);
    })
    .catch(err => res.status(400).json({ podarok : 'cannot find user'}));
});

// create podarok entry

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePodarokInput(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }
  const newPodarok = new Podarok({
    title: req.body.title,
    image: req.body.image,
    price: req.body.price,
    description: req.body.description,
    url: req.body.url,
    occasion: req.body.occasion,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id,
  });
  newPodarok.save().then(podarok => res.json(podarok));
});

//update podarok by id

router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePodarokInput(req.body);
  if(!isValid) {
    return res.status(401).json(errors);
  }
  const podarokFields = {};
  // podarokFields.user = req.user.id;
  if(req.body.title) podarokFields.title = req.body.title;
  if(req.body.image) podarokFields.image = req.body.image;
  if(req.body.price) podarokFields.price = req.body.price;
  if(req.body.description) podarokFields.description = req.body.description;
  if(req.body.url) podarokFields.url = req.body.url;
  if(req.body.occasion) podarokFields.occasion = req.body.occasion;
    Podarok.findOneAndUpdate(
      { _id: req.params.id },
      { $set: podarokFields },
      { new: true }
    )
    .then(podarok => res.json(podarok));
});

// delete podarok

router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findB({ user: req.user.id})
    .then(profile => {
      Podarok.findById(req.params.id)
        .then(podarok => {
          if(podarok.user.toString() !== req.user.id) {
            return res.status(401).json({ notauthorized: 'User not authorized' });
          }
          podarok.remove().then(() => res.json({ success: true}));
        })
        .catch(err => res.status(404).json(podaroknotfound('Podaok not fpund')))
    })
});
//like
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: require.user.id})
    .then(profile => {
      Podarok.findById(req.params.id)
        .then(podarok => {
          if(podarok.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ alreadyliked: 'User already selected that podarok' });
          }
          podarok.likes.unshift({ user: req.user.id});
          //add check that podarok is not created by the user
          podarok.save().then(podarok => res.json(podarok));
        })
        .catch(err => res.status(404).json(podaroknotfound('Podaok not found')))
    })
});

//unlike
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: require.user.id})
    .then(profile => {
      Podarok.findById(req.params.id)
        .then(podarok => {
          if(podarok.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ notliked: 'You have not yet selected that podarok' });
          }
          const removeIndex = podarok.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
          podarok.likes.splice(removeIndex, 1);
          //add check that podarok is not created by the user
          podarok.save().then(podarok => res.json(podarok));
        })
        .catch(err => res.status(404).json(podaroknotfound('Podaok not found')))
    })
});

//add comment
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateCommentInput(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }
  Podarok.findById(req.params.id)
    .then(podarok => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id,
      }
      podarok.comments.unshift(newComment);
      podarok.save().then(podarok => res.json(podarok));
    })
    .catch(err => res.status(404).json({ podaroknotfound: 'No podarok found '}));
});

//remove comment
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Podarok.findById(req.params.id)
    .then(podarok => {
      if(podarok.comments
        .filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
          return res.status(404).json({ commentnotexist: 'Comment not found' })
      }
      const removeIndex = podarok.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);
      podarok.comments.splice(removeIndex, 1);
      podarok.save().then(podarok => res.json(podarok));
    })
    .catch(err => res.status(404).json({ podaroknotfound: 'No podarok found '}));
});


module.exports = router;
