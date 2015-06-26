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
    onLoad:function({title, page, path, data}){
        this.trigger({
            title: title,
            page: page,
            data: data
        });
    }
});

module.exports = pageStore;
