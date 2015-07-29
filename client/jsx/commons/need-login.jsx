var React=require('react');

//ログインが必要なページ
module.exports= React.createClass({
    displayname: "NeedLogin",
    render(){
        if(React.Children.count(this.props.children)===0){
            //デフォルトメッセージ
            return <div className="information">
                <p>この機能を利用するにはログインが必要です。</p>
            </div>;
        }else{
            return <div className="information">{
                this.props.children
            }</div>;
        }
    }
});
