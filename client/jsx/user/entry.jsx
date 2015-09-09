var React=require('react');

var EntryForm = require('../commons/entry-form.jsx');


var Entry = React.createClass({
    displayName:"Entry",
    propTypes:{
        config: React.PropTypes.object
    },
    render:function(){
        return (
            <section>
                <h1>新規登録</h1>
                <div className="warning">
                    <p>このサービスを利用して発生したいかなる損害にも運営者はその責任を負いません。</p>
                    <p>このサービスはアルファ版です。登録されたデータは予告なく変更・削除されることがあります。</p>
                </div>
                <div className="user-entry-form-wrapper">
                    <EntryForm config={this.props.config}/>
                </div>
            </section>);
    }
});

module.exports = Entry;
