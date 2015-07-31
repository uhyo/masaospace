var React=require('react/addons');

var api=require('../../actions/api');

var errorStore = require('../../stores/error');

module.exports = React.createClass({
    displayName:"Reset",
    mixins:[React.addons.LinkedStateMixin],
    propTypes:{
        config: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return {
            end: false,
            id_or_mail:""
        };
    },
    render(){
        if(this.state.end){
            //成功した
            return <section>
                <h1>パスワード再発行</h1>
                <p>登録されたメールアドレスにメールを送信しました。</p>
            </section>;
        }
        return (
            <section>
                <h1>パスワード再発行</h1>
                <p>パスワードが分からなくなった場合は、このフォームからパスワードを再発行できます。</p>
                <p><b>ユーザーID</b>か<b>メールアドレス</b>を入力してください。登録したメールアドレスに再発行用のURLが送信されます。</p>
                <div className="user-reset-form-wrapper">
                    <form className="form" onSubmit={this.handleSubmit}>
                        <p>
                            <input className="form-single" valueLink={this.linkState("id_or_mail")} />
                        </p>
                        <p>
                            <input className="form-single form-button" type="submit" value="送信" />
                        </p>
                    </form>
                </div>
            </section>
        );
    },
    handleSubmit(e){
        e.preventDefault();
        api("/api/user/entry/reset",{
            id_or_mail: this.state.id_or_mail
        })
        .then(()=>{
            this.setState({
                end: true
            });
        })
        .catch(errorStore.emit);
    },
});
