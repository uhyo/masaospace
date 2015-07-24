var React=require('react');

//ログインが必要なページ
module.exports= React.createClass({
    displayname: "NeedLogin",
    render(){
        return <div className="information">
            <p>この機能を利用するにはログインが必要です。</p>
        </div>;
    }
});
