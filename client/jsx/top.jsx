var React=require('react');
var Reflux=require('reflux');

var QueryList=require('./game/parts/query-list.jsx');


module.exports = React.createClass({
    displayName:"Top",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired
    },
    render(){
        return (
            <div>
                {this.welcome()}
                <div className="information">
                    <p>最近の更新：</p>
                    <ul>
                        <li>2015-08-08: 画像をアップロードして正男に使用できるようになりました。</li>
                        <li>2015-08-09: プロフィールにアイコンとURLを登録できるようになりました。</li>
                        <li>2015-08-10: 正男をウェブサイトに埋め込めるようになりました。</li>
                    </ul>
                </div>
                <section>
                    <h1>最近投稿された正男</h1>
                    <QueryList query={{}} limit={10} />
                </section>
            </div>);
    },
    welcome(){
        if(this.props.session.loggedin===true){
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
