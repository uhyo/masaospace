var React=require('react');
var Reflux=require('reflux');

var QueryList=require('./game/parts/query-list.jsx');


module.exports = React.createClass({
    displayName:"Top",
    render(){
        return (
            <div>
                <section>
                    <h1>最近投稿された正男</h1>
                    <QueryList query={{}} limit={10} />
                </section>
            </div>);
    },
});
