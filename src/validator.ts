///<reference path="./node.d.ts" />
//make validator
import config=require('config');

import validator=require('my-validator');
var funcs=validator.funcs;

////////// user
validator.addCustomValidator("isUserID",(value:string)=>{
    return funcs.matches(value,/^[0-9a-zA-Z_]+$/) && funcs.Length(value,config.get("user.screenName.minLength"), config.get("user.screenName.maxLength"));
});
validator.addCustomValidator("isUserName",(value:string)=>{
    return funcs.length(value,config.get("user.name.minLength"), config.get("user.name.maxLength"));
});
validator.addCustomValidator("isPassword",(value:string)=>{
    return funcs.isASCIIPrintable(value) && funcs.length(value,config.get("user.password.minLength"), config.get("user.password.maxLength"));
});
////////// game
validator.addCustomValidator("isGameTitle",(value:string)=>{
    return funcs.length(value,1,config.get("game.title.maxLength"));
});
validator.addCustomValidator("isGameLevel",(value:string)=>{
    if(!funcs.isInteger(value))return false;
    var v=parseInt(value);
    return config.get("game.level.min")<=v && v<=config.get("game.level.max")
});
validator.addCustomValidator("isGameDescription",(value:string)=>{
    return funcs.length(value,0,config.get("game.description.maxLength"));
});

export = validator;
