var React=require('react');
var Reflux=require('reflux');

var QueryList=require('./game/parts/query-list.jsx');

var sessionStore=require('../stores/session');


module.exports = React.createClass({
    displayName:"Top",
    mixins:[Reflux.connect(sessionStore,"session")],
    propTypes:{
        config: React.PropTypes.object.isRequired
    },
    render(){
        return (
            <div>
                {this.welcome()}
                <section>
                    <h1>最近投稿された正男</h1>
                    <QueryList query={{}} limit={10} />
                </section>
            </div>);
    },
    welcome(){
        if(this.state.session.loggedin===true){
            return null;
        }
        //welcomeメッセージ
        var config=this.props.config;
        return (
            <div className="information">
                <p>{config.service.name}にようこそ！</p>
                <p>正男を共有できるサービスです。</p>
                <p>現在利用可能な機能は、ユーザー登録と正男の投稿です。</p>
                <p>さっそく<a href="/entry/page">新規登録</a>して正男を投稿しましょう！</p>
            </div>
        );
    }
});
