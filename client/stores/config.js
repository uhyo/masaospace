//config store
var Reflux=require('reflux');

var set=Reflux.createAction();

var configStore=Reflux.createStore({
    init(){
        this.listenTo(set,this.seth);

        this.config={};
    },
    getInitialState(){
        return this.config;
    },
    seth(config){
        this.config=config;
        this.trigger(config);
    }
});

configStore.set=set;

module.exports = configStore;
