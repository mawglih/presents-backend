router.post('/', passport.authenticate('jwt', { session: false}), (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);
  // check if valid
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