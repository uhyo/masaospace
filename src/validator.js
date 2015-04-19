///<reference path="./node.d.ts" />
//make validator
var config = require('config');
var validator = require('validator');
var expressValidator = require('express-validator');
function makeExpressValidator() {
    //define custom validators
    var conf = {
        customValidators: {
            isUserID: function (value) {
                return validator.matches(value, /^[0-9a-zA-Z_]+$/) && validator.isLength(value, config.get("user.screenName.minLength"), config.get("user.screenName.maxLength"));
            },
            isUserName: function (value) {
                return validator.isLength(value, config.get("user.name.minLength"), config.get("user.name.maxLength"));
            },
            isPassword: function (value) {
                return validator.matches(value, /^[\u0021-\u007e]+$/) && validator.isLength(config.get("user.password.minLength"), config.get("user.password.maxLength"));
            }
        }
    };
    return expressValidator(conf);
}
exports.makeExpressValidator = makeExpressValidator;
