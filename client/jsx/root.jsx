var React=require('react');
var Reflux=require('reflux');
var pageStore = require('../stores/page'),
    sessionStore = require('../stores/session');

var Header=require('./header.jsx');
var Footer=require('./footer.jsx');

var Root = React.createClass({
    displayName:"Root",
    mixins: [Reflux.connect(pageStore,"page"), Reflux.connect(sessionStore,"session")],
    propTypes:{
        config: React.PropTypes.object,
        page: React.PropTypes.string,
        csrfToken: React.PropTypes.string,
        session: React.PropTypes.object,
        data: React.PropTypes.object
    },
    render:function(){
        var session = this.state.session || this.props.session;
        var [elm,props]=this.getPage();
        return (<div className="root">
            <Header session={session} />
            {React.createElement(elm,props)}
            <Footer />
        </div>);
    },
    getPage:function(){
        var session = this.state.session || this.props.session;
        var page=this.state.page || this.props;
        switch(page.page){
            case "top":
                //top page
                return [require('./top.jsx'),{
                    config: this.props.config,
                    session: session
                }];
            ///// user
            case "user.entry":
                //entry page
                return [require('./user/entry.jsx'),{
                    config: this.props.config
                }];
            case "user.ticket":
                //ticket confirmation page
                return [require('./user/ticket.jsx'),{
                    ticket: page.data.ticket,
                    screen_name: page.data.screen_name,
                    config: this.props.config
                }];
            case "user.page":
                return [require('./user/page.jsx'),{
                    userid: page.data.userid,
                    data: page.data.data
                }];

            case "user.my":
                //mypage
                return [require('./user/my.jsx'),{
                    session: session
                }];
            case "user.account":
                //account settings
                return [require('./user/account.jsx'),{
                    config: this.props.config,
                    session: session
                }];
            ///// game
            case "game.new":
                return [require('./game/new.jsx'),{
                    config: this.props.config,
                    session: session
                }];
            case "game.play":
                return [require('./game/play.jsx'),{
                    game: page.data.game,
                    metadata: page.data.metadata,
                    owner: page.data.owner,

                    session: session
                }]
            case "game.list":
                return [require('./game/list.jsx'),{
                    owner: page.data.owner
                }];
            default:
                //"404"とか
                return [require('./notfound.jsx'),null]
        }
    }
});

module.exports = Root;
