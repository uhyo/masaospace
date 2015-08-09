var React=require('react');
var Reflux=require('reflux');

var QueryList=require('../game/parts/query-list.jsx'),
    UserIcon=require('../commons/user-icon.jsx');

module.exports = React.createClass({
    displayName:"UserPage",
    propTypes:{
        userid: React.PropTypes.string,
        data: React.PropTypes.object
    },
    render(){
        var user=this.props.data;
        var query={
            owner: this.props.userid
        };
        return (
            <section className="user-page">
                <h1>{user.name}</h1>
                <div className="user-page-info">
                    <div className="user-page-icon">
                        <UserIcon icon={user.icon} size={128}/>
                    </div>
                    {this.profile(user)}
                </div>
                <section className="user-page-list">
                    <h1>{user.name}の正男</h1>
                    <QueryList query={query} />
                </section>
            </section>
        );
    },
    profile(user){
        if(user.profile){
            var url=null;
            if(user.url){
                url=<p>
                    <a href={user.url} className="external" target="_blank">{user.url}</a>
                </p>;
            }
            return (
                <div className="user-page-profile">
                    <p>{user.profile}</p>
                    {url}
                </div>
            );
        }else{
            //プロフィールがない
            return (
                <div className="user-page-profile user-page-profile-empty">
                    <p>プロフィールが登録されていません。</p>
                </div>
            );
        }
    }
});
