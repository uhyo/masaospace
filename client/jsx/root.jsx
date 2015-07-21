var React=require('react');
var Reflux=require('reflux');
var pageStore = require('../stores/page');

var Header=require('./header.jsx');
var Footer=require('./footer.jsx');

var Root = React.createClass({
    displayName:"Root",
    mixins: [Reflux.connect(pageStore,"page")],
    render:function(){
        var sp=this.state.page || this.props;
        var page=this.getPage();
        return (<div className="root">
            <Header />
            {React.createElement(page,sp.data)}
            <Footer />
        </div>);
    },
    getPage:function(){
        var page=this.state.page || this.props;
        switch(page.page){
            case "top":
                //top page
                return require('./top.jsx');
            ///// user
            case "user.entry":
                //entry page
                return require('./user/entry.jsx');
            case "user.ticket":
                //ticket confirmation page
                return require('./user/ticket.jsx');
            case "user.page":
                return require('./user/page.jsx');
            case "user.my":
                //mypage
                return require('./user/my.jsx');
            case "user.account":
                //account settings
                return require('./user/account.jsx');
            ///// game
            case "game.new":
                return require('./game/new.jsx');
            case "game.play":
                return require('./game/play.jsx');
            case "game.list":
                return require('./game/list.jsx');
            default:
                //"404"とか
                return require('./notfound.jsx');
        }
    }
});

module.exports = Root;
