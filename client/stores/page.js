// page data
var Reflux=require('reflux');

var pageAction=require('../actions/page');

var pageStore=Reflux.createStore({
    listenables:{
        "load":pageAction.load.completed
    },
    getInitialState:function(){
        return null;
    },
    onLoad:function({page, path, data}){
        this.trigger({
            page: page,
            data: data
        });
    }
});

module.exports = pageStore;
