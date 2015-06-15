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
        "login":userAction.login.completed
    },
    init:function(){
    },
    getInitialState:function(){
        return {
            loggedin: false,
            screen_name: null,
            name: null
        };
    },
    onLogin:function(loginresult){
        this.trigger({
            loggedin: true,
            screen_name: loginresult.screen_name,
            name: loginresult.name
        });
    }
});


module.exports = sessionStore;
