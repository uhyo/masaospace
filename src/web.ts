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

import React=require('react');
import nodejsx=require('node-jsx');

import {makeFrontRouter} from './front/index';

import logger=require('./logger');
import db=require('./db');
import validator=require('./validator');

import Controller=require('./controllers/index');

nodejsx.install({
    harmony:true
});

var Root=require('../client/jsx/root.jsx');

export class WebServer{
    private app:express.Express;
    constructor(){
    }
    init(c:Controller,callback:Cont):void{
        //open web server
        this.app=express();
        // set some methods
        this.app.request.validationErrorResponse=function(res){
            /* response with validation errors */
            var e=this._validationErrors;
            if(e.length>0){
                res.json({
                    //TODO
                    error:JSON.stringify(e)
                });
                return true;
            }
            return false;
        };
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
            path:path.resolve(__dirname,"..","dist"),
            url:"/static",
            index:false
        }));
        //validator
        this.app.use(validator.forExpress);
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
                        (<any>router).use("/"+path.basename(files[i],".js"),subroute);
                        (new mod).route(subroute,c);
                    }
                }

            }
        }
    }
    //front pages
    front(c:Controller):void{
        var r=makeFrontRouter(c);

        // pathに対応するページのデータをあげる
        this.app.post("/api/front",(req,res)=>{
            if("string"!==typeof req.body.path){
                res.json({
                    error: "undefined path"
                });
                return;
            }
            var re=r.route(req.body.path);
            if(re==null){
                res.json({
                    error: "page does not exist"
                });
                return;
            }
            re.result(re.params,(err,view)=>{
                if(err){
                    throw err;
                }
                res.json({
                    title: view.title,
                    page: view.page,
                    data: view.data
                });
            });
        });
        this.app.get("*",(req,res)=>{
            var re=r.route(req.path);
            var func = re ? re.result : null;
            var params = re ? re.params : {};
            if(func==null){
                /* 404 */
                res.status(404);
                func=(obj,callback)=>{
                    callback(null,{
                        //TODO
                        title: "Page not found",
                        page: "404",
                        data:{}
                    });
                };
            }
            func(params,(err,view)=>{
                if(err){
                    throw err;
                }
                var session = req.session.user!=null ? {
                    screen_name: req.session.screen_name,
                    name: req.session.name
                } : null;
                var initialData={
                    page: view.page,
                    csrfToken: req.csrfToken(),
                    session:session,
                    data: view.data
                };
                res.render("index.ect",{
                    title: view.title,
                    initial: initialData,
                    content: React.renderToString(React.createElement(Root,initialData))
                });
            });
        });
    }
}
