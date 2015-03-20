///<reference path="./node.d.ts" />
// Web server
import config=require('config');

import fs=require('fs');
import path=require('path');
import https=require('https');
import express=require('express');

import bodyParser=require('body-parser');
import expressSession=require('express-session');
import connectRedis=require('connect-redis');
import csurf=require('csurf');

import logger=require('./logger');
import db=require('./db');

export class WebServer{
    private app:express.Express;
    constructor(){
    }
    init(db:db.DBAccess,callback:Cont):void{
        //open web server
        this.app=express();
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));
        //session
        var sessoption={
            secret: config.get("session.secret"),
            resave: false,
            saveUninitialized: false,
            cookie:{
                secure: config.get("webserver.secure")
            },
            store: new (connectRedis(expressSession))({
                client: db.redis.getClient(),
                ttl: config.get("session.life"),
                db: config.get("redis.db"),
                prefix: "sess:"
            })
        };
        this.app.use(expressSession(sessoption));
        this.app.use(csurf());
        //error handling
        this.app.use((err,req,res,next)=>{
            if(req.xhr){
                //JSON error response
                logger.error(err);
                res.status(500).json({error: String(err)});
            }else{
                //normal error response
                res.status(500).send(String(err));
            }
        });

        this.route(db);

        this.app.listen(config.get("webserver.port"));
        process.nextTick(()=>{
            callback(null);
        });
    }
    route(db:db.DBAccess):void{
        var t=this;
        var apiroot=express.Router();
        // api/を全部読み込む
        var apipath=path.resolve(__dirname,"api");
        readDir(apipath,apiroot);

        this.app.use("/api",apiroot);

        function readDir(dirpath:string,router:express._Router):void{
            //ディレクトリを読む
            var files:Array<string>=fs.readdirSync(dirpath);
            for(var i=0;i<files.length;i++){
                var filepath=path.resolve(dirpath,files[i]);
                var st=fs.statSync(filepath);
                if(st.isDirectory()){
                    //open subdirectory
                    var subroute=router.route(files[i]);
                    readDir(filepath,subroute);
                }else if(path.extname(files[i])===".js"){
                    //js file
                    var mod=require(filepath);
                    if("function"===typeof mod){
                        var subroute=router.route(files[i]);
                        (new mod).route(subroute,db);
                    }
                }

            }
        }
    }
}
