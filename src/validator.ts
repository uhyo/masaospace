///<reference path="./node.d.ts" />
//make validator
import config=require('config');

import validator=require('validator');
import expressValidator=require('express-validator');

export function makeExpressValidator():any{
    //define custom validators
    var conf={
        customValidators:<any>{
            ////////// user
            isUserID:(value:string)=>{
                return validator.matches(value,/^[0-9a-zA-Z_]+$/) && validator.isLength(value,config.get("user.screenName.minLength"), config.get("user.screenName.maxLength"));
            },
            isUserName:(value:string)=>{
                return validator.isLength(value,config.get("user.name.minLength"), config.get("user.name.maxLength"));
            },
            isPassword:(value:string)=>{
                return validator.matches(value,/^[\u0021-\u007e]+$/) && validator.isLength(value,config.get("user.password.minLength"), config.get("user.password.maxLength"));
            },
            ////////// game
            isGameTitle:(value:string)=>{
                return validator.isLength(value,1,config.get("game.title.maxLength"));
            },
            isGameLevel:(value:string)=>{
                return validator.isInt(value,{min: config.get("game.level.min"), max: config.get("game.level.max")});
            },
            isGameDescription:(value:string)=>{
                return validator.isLength(value,0,config.get("game.description.maxLength"));
            }
        }
    };
    return expressValidator(conf);
}
