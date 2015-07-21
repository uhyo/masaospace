var React=require('react');
var Reflux=require('reflux');

var QueryList=require('../game/parts/query-list.jsx');

module.exports = React.createClass({
    displayName:"UserPage",
    render:function(){
        //TODO
        var user=this.props.data;
        var query={
            owner: this.props.userid
        };
        return (
            <section className="user-page">
                <h1>{user.name}</h1>
                <QueryList query={query} />
            </section>
        );
    }
});
