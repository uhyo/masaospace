///<reference path="./node.d.ts" />
//make validator
import config = require('config');

import validator = require('my-validator');
var funcs = validator.funcs;

////////// user
validator.addCustomValidator('isUserID', (value: string) => {
  return (
    !funcs.matches(value, /^[0-9a-zA-Z_]+$/) &&
    !funcs.length(
      value,
      config.get('user.screenName.minLength'),
      config.get('user.screenName.maxLength'),
    )
  );
});
validator.addCustomValidator('isUserName', (value: string) => {
  return !funcs.length(value, config.get('user.name.maxLength'));
});
validator.addCustomValidator('isPassword', (value: string) => {
  return (
    !funcs.isASCIIPrintable(value) &&
    !funcs.length(
      value,
      config.get('user.password.minLength'),
      config.get('user.password.maxLength'),
    )
  );
});
validator.addCustomValidator('isUserProfile', (value: string) => {
  return !funcs.length(value, config.get('user.profile.maxLength'));
});
validator.addCustomValidator('isUserURL', (value: string) => {
  //簡易的な
  return !funcs.length(value, config.get('user.url.maxLength'));
});
////////// game
validator.addCustomValidator('isGameTitle', (value: string) => {
  return !funcs.length(value, 1, config.get('game.title.maxLength'));
});
validator.addCustomValidator('isGameDescription', (value: string) => {
  return !funcs.length(value, 0, config.get('game.description.maxLength'));
});
validator.addCustomValidator('isGameTag', (value: string) => {
  return !funcs.length(value, 0, config.get('game.tag.maxLength'));
});

////////// comment
validator.addCustomValidator('isComment', (value: string) => {
  return !funcs.length(value, 1, config.get('comment.maxLength'));
});

///////// series
validator.addCustomValidator('isSeriesName', (value: string) => {
  return !funcs.length(value, 1, config.get('series.name.maxLength'));
});
validator.addCustomValidator('isSeriesDescription', (value: string) => {
  return !funcs.length(value, 1, config.get('series.description.maxLength'));
});

export = validator;
