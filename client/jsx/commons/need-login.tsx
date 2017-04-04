import * as React from 'react';

//ログインが必要なページ
export default class NeedLogin extends React.Component<{}, {}>{
    render(){
        const {
            children,
        } = this.props;
        if(React.Children.count(children)===0){
            //デフォルトメッセージ
            return <div className="information">
                <p>この機能を利用するにはログインが必要です。</p>
            </div>;
        }else{
            return <div className="information">{
                children
            }</div>;
        }
    }
};
