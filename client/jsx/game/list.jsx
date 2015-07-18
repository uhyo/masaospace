var React = require('react');

var QueryList=require('./parts/query-list.jsx');

module.exports = React.createClass({
    displayName:"GameList",
    propTypes:{
        //検索条件
        owner:React.PropTypes.string
    },

    render:function(){
        var queryobj={
            owner: this.props.owner
        };
        return (
            <div>
                <h1>検索結果</h1>
                <QueryList query={queryobj} />
            </div>
        );
    }
});

