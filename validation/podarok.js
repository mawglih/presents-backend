const Validator = require('validator');
const isEmpty = require('./is-Empty');

module.exports = function validatePodarokInput(data) {
  let errors = {};

  
  data.title = !isEmpty(data.title) ? data.title : '';
  data.image = !isEmpty(data.image) ? data.image : '';
  data.url = !isEmpty(data.url) ? data.url : '';

  if(!Validator.isURL(data.url)) {
    errors.urll = 'URL is invalid';
  }
  
  if(Validator.isEmpty(data.title)) {
    errors.title = 'Title field is required';
  }


  if(Validator.isEmpty(data.image)) {
    errors.image = 'Image field is required';
  }

  if(Validator.isEmpty(data.url)) {
    errors.url = 'URL field is required';
  }

  if(Validator.isLength(data.description, {min: 10, max: 400 })) {
    errors.description = 'Description must be between 10 and 400 charachters';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};