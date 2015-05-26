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
import st=require('st');
import ect=require('ect');

import logger=require('./logger');
import db=require('./db');
import validator=require('./validator');

import Controller=require('./controllers/index');

export class WebServer{
    private app:express.Express;
    constructor(){
    }
    init(c:Controller,callback:Cont):void{
        //open web server
        this.app=express();
        //rendering engine
        var views=path.resolve(__dirname,"..","client","views");
        var ectRenderer=ect({
            root:views,
            ext:".ect"
        });
        this.app.set("views",views);
        this.app.set("view engine","ect");
        this.app.engine("ect",ectRenderer.render);
        // bodyparser
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));
        //static files
        this.app.use(st({
            path:path.resolve(__dirname,"..","client","static"),
            url:"/static",
            index:false
        }));
        //validator
        this.app.use(validator.makeExpressValidator());
        //session
        var sessoption={
            secret: config.get("session.secret"),
            resave: false,
            saveUninitialized: false,
            cookie:{
                secure: config.get("webserver.secure")
            },
            store: new (connectRedis(expressSession))({
                client: c.getRedisClient(),
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

        this.route(c);
        this.front(c);

        this.app.listen(config.get("webserver.port"));
        process.nextTick(()=>{
            callback(null);
        });
    }
    //route apis
    route(c:Controller):void{
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
                        var subroute=express.Router();
                        (<any>router).use("/"+files[i],subroute);
                        (new mod).route(subroute,c);
                    }
                }

            }
        }
    }
    //front pages
    front(c:Controller):void{
        // TODO
        this.app.get("/",(req,res)=>{
            res.render("index.ect",{
                title: "foo",
                content: "<p>bar</p>"
            });
        });
    }
}
