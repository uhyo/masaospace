var Reflux=require('reflux');

var userAction=require('../actions/user');


//エラーメッセージを集約

/*
 * errorStore {
 *   logs: Array<string>
 * }
 *
 */

var errorStore=Reflux.createStore({
    init(){
        this.listenTo(userAction.login.failed, this.someError);
        this.listenTo(userAction.logout.failed, this.someError);
        this.listenTo(userAction.update.failed, this.someError);

        this.logs=[];
    },
    someError(err){
        this.logs=this.logs.concat(err);
        this.trigger({
            logs:this.logs
        });
    }
});

errorStore.reset=function(){
    errorStore.logs=[];
    errorStore.trigger({
        logs: []
    });
};

module.exports = errorStore;
