var React=require('react');
var Reflux=require('reflux');

var QueryList=require('../game/parts/query-list.jsx');

module.exports = React.createClass({
    displayName:"UserPage",
    render(){
        var user=this.props.data;
        var query={
            owner: this.props.userid
        };
        return (
            <section className="user-page">
                <h1>{user.name}</h1>
                {this.profile(user)}
                <section className="user-page-list">
                    <h1>{user.name}の正男</h1>
                    <QueryList query={query} />
                </section>
            </section>
        );
    },
    profile(user){
        if(user.profile){
            return (
                <div className="user-page-profile">
                    <p>{user.profile}</p>
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
