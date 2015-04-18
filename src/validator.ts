///<reference path="./node.d.ts" />
//make validator
import config=require('config');

import validator=require('validator');
import expressValidator=require('express-validator');

export function makeExpressValidator():any{
    //define custom validators
    var conf={
        customValidators:<any>{
            isUserID:(value:string)=>{
                return validator.matches(value,/^[0-9a-zA-Z_]+$/) && validator.isLength(value,config.get("user.screenName.minLength"), config.get("user.screenName.maxLength"));
            },
            isUserName:(value:string)=>{
                return validator.isLength(value,config.get("user.name.minLength"), config.get("user.name.maxLength"));
            },
        }
    };
    return expressValidator(conf);
}
