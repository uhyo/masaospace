///<reference path="./node.d.ts" />
//Prepare Logger
var config = require('config');
var Log = require('log');
var logger = new Log(config.get("log.level"));
module.exports = logger;
