var Reflux=require('reflux');
var extend=require('extend');

var userAction=require('../actions/user');

/*
 * serverの場合nullになることも！
 * sessionStore {
 *   loggedin: <boolean>,
 *   user: <string>,
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
        this.state=null;
    },
    getInitialState:function(){
        return this.state;
    },
    onInit:function(init){
        this.trigger(this.state=init);
    },
    onLogin:function(loginresult){
        this.trigger(this.state={
            loggedin: true,
            user: loginresult.user,
            screen_name: loginresult.screen_name,
            name: loginresult.name,
            profile: loginresult.profile
        });
    },
    onLogout:function(){
        this.trigger(this.state={
            loggedin: false,
            user: null,
            screen_name: null,
            name: null,
            profile: null
        });
    },
    onUpdate:function(updateresult){
        this.trigger(this.state=extend({},this.state,{
            name:updateresult.name,
            profile:updateresult.profile
        }));
    },
});


module.exports = sessionStore;
