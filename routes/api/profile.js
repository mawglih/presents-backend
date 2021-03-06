const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Profile = require('../../models/Profile');
const Podarok = require('../../models/Podarok');
const User = require('../../models/User');

const validateProfileInput = require('../../validation/profile');
const validateOccasionsInput = require('../../validation/occasions');
const validateEducationInput = require('../../validation/education');

router.get('/test', (req, res) => res.json({ msg: "profile works"}));

router.get('/', passport.authenticate('jwt', { session: false}), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for that user';
        return res.status(404).json(errors)
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

router.get('/handle/:handle', (req, res) => {
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

router.get('/user/:user_id', (req, res) => {
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ profile: 'There is no profile for this user' }));
});

router.get('/all', (req, res) => {
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if(!profiles) {
        errors.noprofile = 'There is no profiles';
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profiles: 'Thire are no profiles' }));
})

router.post('/', passport.authenticate('jwt', { session: false}), (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);
  // chaeck if valid
  if(!isValid) {
    return res.status(400).json(errors);
  }
  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.location) profileFields.location = req.body.location;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.statusP) profileFields.status = req.body.statusP;
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
  if(typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }
  if(req.body.skillLevel) profileFields.skillLevel = req.body.skillLevel;
  profileFields.social = {};
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.facebooke) profileFields.social.facebooke = req.body.facebooke;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({user: req.user.id})
    .then(profile => {
      if(profile) {
        Profile.findOneAndUpdate(
          { user : req.user.id },
          { $set: profileFields },
          { new: true },
        )
        .then(profile => res.json(profile));
      } else {
        Profile.findOne({ handle: profileFields.handle })
          .then(profile => {
            if(profile) {
              errors.handle = 'That handle already exists';
              res.status(400).json(errors);
            }
            new Profile(profileFields).save()
              .then(profile => res.json(profile));
          });
      }
    })
});

// occasions and experience

router.post('/occasions', passport.authenticate('jwt', { session: false}), (req, res) => {
  const { errors, isValid } = validateOccasionsInput(req.body);
  // chaeck if valid
  if(!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newOccasion = {
        title: req.body.title,
        at: req.body.at,
        special: req.body.special,
        description: req.body.description,
      }
      // add to array
      profile.occasions.unshift(newOccasion);
      profile.save().then(profile => res.json(profile));
    })
});

router.get('/occasions/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
  console.log(req.params.id);
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const occ = profile.occasions
        .find(item => {
          if(item._id.toString() === req.params.id) {
            console.log(item._id);
            return item;
          }
        });
        res.json(occ);
      })
      .catch(err => res.status(404).json("no profile found"));
});

router.put('/occasions/:id', passport.authenticate('jwt', { session:false}), (req, res) => {
  const occasionFields = {};
  if(req.body.title) occasionFields.title = req.body.title;
  if(req.body.description) occasionFields.description = req.body.description;
  if(req.body.at) occasionFields.at = req.body.at;
  if(req.body.special) occasionFields.special = req.body.special;
  Profile.findOne({user: req.user.id})
    .then(profile => {
      if(profile) {
        const findIndex = profile.occasions
        .map(item => item.id)
        .indexOf(req.params.id);
      profile.occasions.splice(findIndex, 1, occasionFields);
      profile.save().then(profile => res.json(profile));
      } else {
        errors.occasion = 'That occasion does not exist';
        res.status(400).json(errors);
      }
  })
});

router.delete('/occasions/:occ_id', passport.authenticate('jwt', { session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const removeIndex = profile.occasions
        .map(item => item.id)
        .indexOf(req.params.occ_id);
      profile.occasions.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

router.post('/education', passport.authenticate('jwt', { session: false}), (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);
  // check if valid
  if(!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      }
      // add to array
      profile.education.unshift(newEdu);
      profile.save().then(profile => res.json(profile));
    })
});

router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);
      profile.education.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

router.delete('/', passport.authenticate('jwt', { session: false}), (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({ success: true}));
    })
    .catch(err => res.status(404).json(err));
});

module.exports = router;
