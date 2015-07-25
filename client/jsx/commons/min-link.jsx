var React=require('react');

//LinkedState mixin with minLength support
//nameと同名のrefにinputがあることが必要
module.exports = {
    linkState(name,minLength){
        var cmpn=this;
        var valueLink={
            value: this.state[name],
            requestChange: (value)=>{
                var t=React.findDOMNode(cmpn.refs[name]);
                cmpn.setState({
                    [name]: value
                });
                //validate
                if(minLength!=null){
                    if(value && (value.length < minLength)){
                        //invalidだ
                        if(t.validity.tooShort !== true){
                            //自前で
                            t.setCustomValidity("入力値が短すぎます。最低"+minLength+"文字入力してください。");
                        }
                    }else{
                        t.setCustomValidity("");
                    }
                }
            }
        };
        return valueLink;
    }
};
