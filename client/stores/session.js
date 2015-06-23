var Reflux=require('reflux');
var extend=require('extend');

var userAction=require('../actions/user');

/*
 * sessionStore {
 *   loggedin: <boolean>,
 *   screen_name: <string>,
 *   name: <string>
 * }
 */
var sessionStore=Reflux.createStore({
    listenables:{
        "init":userAction.init,
        "login":userAction.login.completed,
        "logout":userAction.logout.completed,
        "update":userAction.update.completed
    },
    init:function(){
        this.state={
            loggedin: false,
            screen_name: null,
            name: null
        };
    },
    getInitialState:function(){
        return this.state;
    },
    onInit:function(init){
        if(init==null){
            this.trigger(this.state={
                loggedin: false,
                screen_name: null,
                name: null
            });
        }else{
            this.trigger(this.state={
                loggedin: true,
                screen_name: init.screen_name,
                name: init.name
            });
        }
    },
    onLogin:function(loginresult){
        this.trigger(this.state={
            loggedin: true,
            screen_name: loginresult.screen_name,
            name: loginresult.name
        });
    },
    onLogout:function(){
        this.trigger(this.state={
            loggedin: false,
            screen_name: null,
            name: null
        });
    },
    onUpdate:function(updateresult){
        this.trigger(this.state=extend(this.state,{
            name:updateresult.name
        }));
    },
});


module.exports = sessionStore;
