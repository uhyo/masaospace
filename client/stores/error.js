var Reflux=require('reflux');

var userAction=require('../actions/user');

var emitError=Reflux.createAction();

//エラーメッセージを集約

/*
 * errorStore {
 *   logs: Array<string>
 * }
 *
 */

var errorStore=Reflux.createStore({
    init(){
        this.listenTo(emitError, this.someError);
        this.listenTo(userAction.login.failed, this.someError);
        this.listenTo(userAction.logout.failed, this.someError);
        this.listenTo(userAction.update.failed, this.someError);

        this.logs=[];
    },
    someError(err){
        console.error(err);
        this.logs=this.logs.concat(String(err));
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

errorStore.emit=emitError;

module.exports = errorStore;
