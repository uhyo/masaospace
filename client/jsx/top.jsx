var React=require('react');
var Reflux=require('reflux');

var path=require('../scripts/path');

var QueryList=require('./game/parts/query-list.jsx');


module.exports = React.createClass({
    displayName:"Top",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired,
        data: React.PropTypes.shape({
            popularTags: React.PropTypes.arrayOf(React.PropTypes.string.isRequired).isRequired
        }).isRequired
    },
    render(){
        //人気のタグ表示
        var tags=null;
        if(this.props.data.popularTags.length>0){
            tags=<div className="top-tags">
                <p><span className="icon icon-tag"/>人気のタグ： {
                    this.props.data.popularTags.map((tag,i)=>{
                        return <span key={i}>
                            <a href={path.gameListByTag(tag)}>{tag}</a>
                            {"\u3000"}
                        </span>
                    })
                }</p>
            </div>;
        }
        return (
            <div>
                {this.welcome()}
                <div className="information">
                    <p>最近の更新：</p>
                    <ul>
                        <li>2015-09-10: 正男エディタで正男を作成・編集できるようになりました。</li>
                        <li>2015-10-06: スコアランキングに対応しました。</li>
                        <li>2016-03-24: スクリプト正男を投稿可能にしました。</li>
                    </ul>
                </div>
                {tags}
                <section>
                    <h1>最近投稿された正男</h1>
                    <QueryList query={{}} limit={15} />
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
                <p>さっそく<a href="/entry/page">新規登録</a>して<a href="/game/new">正男を投稿</a>しましょう！</p>
            </div>
        );
    }
});
