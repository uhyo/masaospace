var React=require('react');

var EntryForm = require('../commons/entry-form.jsx');


var Entry = React.createClass({
    displayName:"Entry",
    render:function(){
        return (
            <section>
                <h1>新規登録</h1>
                <EntryForm />
            </section>);
    }
});

module.exports = Entry;
