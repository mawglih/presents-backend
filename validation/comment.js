const Validator = require('validator');
const isEmpty = require('./is-Empty');

module.exports = function validateCommentInput(data) {
  let errors = {};

  
  data.text = !isEmpty(data.text) ? data.text : '';

  if(Validator.isEmpty(data.text)) {
    errors.text = 'Text field is required';
  }

  if(Validator.isLength(data.text, {min: 10, max: 400 })) {
    errors.text = 'Comment must be between 10 and 400 charachters';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
