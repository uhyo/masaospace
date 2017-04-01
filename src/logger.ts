///<reference path="./node.d.ts" />
//Prepare Logger
import * as config from 'config';
import Log = require('log');

var logger=new Log(config.get("log.level"));
export = logger;


