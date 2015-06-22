var Reflux=require('reflux');

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
        "logout":userAction.logout.completed
    },
    getInitialState:function(){
        return {
            loggedin: false,
            screen_name: null,
            name: null
        };
    },
    onInit:function(init){
        if(init==null){
            this.trigger({
                loggedin: false,
                screen_name: null,
                name: null
            });
        }else{
            this.trigger({
                loggedin: true,
                screen_name: init.screen_name,
                name: init.name
            });
        }
    },
    onLogin:function(loginresult){
        this.trigger({
            loggedin: true,
            screen_name: loginresult.screen_name,
            name: loginresult.name
        });
    },
    onLogout:function(){
        this.trigger({
            loggedin: false,
            screen_name: null,
            name: null
        });
    }
});


module.exports = sessionStore;
