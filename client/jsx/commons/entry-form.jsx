var React=require('react');
var Reflux=require('reflux');

var api=require('../../actions/api');

var MinLinkMixin=require('./min-link.jsx');

var errorStore=require('../../stores/error');


module.exports = React.createClass({
    displayName: "EntryForm",
    mixins:[MinLinkMixin],
    propTypes:{
        config: React.PropTypes.object
    },
    getInitialState:function(){
        return {
            form: true,

            screen_name:"",
            name:"",
            mail:""
        };
    },
    handleSubmit: function(e){
        e.preventDefault();
        var t=this;
        //entry request
        api("/api/user/entry",{
            screen_name: this.state.screen_name,
            name: this.state.name,
            mail: this.state.mail
        })
        .then(function(obj){
            t.setState({
                form:false,
                screen_name: obj.screen_name,
            });
        })
        .catch(errorStore.emit);
    },
    render: function(){
        var config=this.props.config.user;
        if(this.state.form){
            return (
                <div>
                    <form className="form" onSubmit={this.handleSubmit}>
                        <p>
                            <label className="form-row">
                                <span>ユーザーID</span>
                                <input ref="screen_name" valueLink={this.linkState("screen_name",config.screenName.minLength)} minLength={config.screenName.minLength} maxLength={config.screenName.maxLength} required />
                            </label>
                        </p>
                        <p>
                            <label className="form-row">
                                <span>ユーザー名</span>
                                <input ref="name" required valueLink={this.linkState("name")} />
                            </label>
                        </p>
                        <p>
                            <label className="form-row">
                                <span>メールアドレス</span>
                                <input type="email" ref="mail" required valueLink={this.linkState("mail")} />
                            </label>
                        </p>
                        <p><input className="form-single form-button" type="submit" value="登録" /></p>
                    </form>
                    <p>ユーザーID・ユーザー名を決めてください。</p>
                    <p>入力したメールアドレスに登録手続用のメールが送信されます。</p>
                </div>
            );
        }else{
            return (
                <div>
                    <p><b>{this.state.mail}</b>に登録手続用のメールを送信しました。</p>
                    <p>メールに掲載されたリンクから登録手続を進めてください。</p>
                    <p>このページは閉じても構いません。</p>
                </div>);
        }
    }
});
