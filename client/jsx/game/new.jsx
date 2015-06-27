var React = require('react');

var MasaoSelector = require('./masao-selector.jsx');

module.exports = React.createClass({
    displayName:"New",
    masaoSelected:function(file){

    },
    render:function(){
        return (
            <section>
                <h1>新しい正男を投稿</h1>
                <MasaoSelector onSelect={this.masaoSelected} />
            </section>
        );
    }
});
