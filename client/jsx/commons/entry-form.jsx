var React=require('react');
var Reflux=require('reflux');

var api=require('../../actions/api');

var ErrorMessage=require('./error.jsx');


module.exports = React.createClass({
    displayName: "EntryForm",
    getInitialState:function(){
        return {
            form: true,

            error:null,
            screen_name:"",
            name:"",
            mail:""
        };
    },
    handleChange: function(e){
        var name=e.target.name;
        if(name==="screen_name" || name==="name" || name==="mail"){
            var obj={};
            obj[name]=e.target.value;
            this.setState(obj);
        }
    },
    handleSubmit: function(e){
        e.preventDefault();
        var t=this;
        //login request
        api("/api/user/entry",{
            screen_name: this.state.screen_name,
            name: this.state.name,
            mail: this.state.mail
        })
        .then(function(obj){
            t.setState({
                form:false,
                screen_name: obj.screen_name,
                //TODO
                ticket: obj.ticket
            });
        })
        .catch(function(e){
            t.setState({
                error:String(e)
            });
        });
    },
    render: function(){
        if(this.state.form){
            return (
                <div>
                    <ErrorMessage>{this.state.error}</ErrorMessage>
                    <form onSubmit={this.handleSubmit}>
                        <p>User ID: <input name="screen_name" onChange={this.handleChange} value={this.state.screen_name} /></p>
                        <p>User name: <input name="name" onChange={this.handleChange} value={this.state.name} /></p>
                        <p>EMail: <input type="email" name="mail" onChange={this.handleChange} value={this.state.mail} /></p>
                        <p><input type="submit" value="登録" /></p>
                    </form>
                </div>
            );
        }else{
            //TODO
            return (
                <div>
                    <p><b>{this.state.mail}</b>にメールを送信しました。（してない）</p>
                    <p>ticket: <code>{this.state.ticket}</code></p>
                </div>);
        }
    }
});
