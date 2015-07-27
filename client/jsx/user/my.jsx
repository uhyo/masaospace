var React=require('react');
var Reflux=require('reflux');

var NeedLogin=require('../commons/need-login.jsx');

var MyPage=React.createClass({
    displayName:"MyPage",
    propTypes:{
        session: React.PropTypes.object.isRequire
    },
    getInitialState:function(){
        return {
        };
    },
    render:function(){
        return (
            <section>
                <h1>マイページ</h1>
                {this.myPageContent()}
            </section>
        );
    },
    myPageContent:function(){
        var session=this.props.session;
        if(session.loggedin){
            return (
                <div>
                    <p><b>{session.name}</b> ({session.screen_name})</p>
                    <p><a href="/my/account">アカウント設定</a></p>
                    <p><a href={`/game/list?owner=${session.user}`}>マイ正男</a></p>
                </div>
            );
        }else{
            return <NeedLogin/>;
        }
    }
});

module.exports = MyPage;
