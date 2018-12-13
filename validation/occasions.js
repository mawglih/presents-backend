const Validator = require('validator');
const isEmpty = require('./is-Empty');

module.exports = function validateOccasionsInput(data) {
  let errors = {};

  
  data.title = !isEmpty(data.title) ? data.title : '';
  data.at = !isEmpty(data.at) ? data.at : '';
  
  if(Validator.isEmpty(data.title)) {
    errors.title = 'Job title field is required';
  }

  if(Validator.isEmpty(data.at)) {
    errors.at = 'Date at field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};