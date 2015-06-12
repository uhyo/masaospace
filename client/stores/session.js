var Reflux=require('reflux');

var userAction=require('../action/user');

var sessionStore=Reflux.createStore({
    listenables:{
        "login":userAction.login.completed
    },
    init:function(){
        this.data={
            loggedin: false,
            userid: null
        };
    },
    onLogin:function(loginresult){
    }
});


exports.sessionStore = sessionStore;
