var React=require('react');
var Reflux=require('reflux');

var sessionStore=require('../../stores/session');

var MyPage=React.createClass({
    displayName:"MyPage",
    mixins: [Reflux.connect(sessionStore,"session")],
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
        var session=this.state.session;
        if(session.loggedin){
            return (
                <div>
                    <p><b>{session.name}</b> ({session.screen_name})</p>
                </div>
            );
        }else{
            return (
                <p>ログインしていません。</p>
            );
        }
    }
});

module.exports = MyPage;
