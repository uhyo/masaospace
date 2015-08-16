//StrList（フォーム要素的な）
var React=require('react');

module.exports = React.createClass({
    displayName:"StrList",
    propTypes:{
        value: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),
        onChange: React.PropTypes.func,
        valueLink: React.PropTypes.shape({
            value: React.PropTypes.arrayOf(React.PropTypes.string.isRequired).isRequired,
            requestChange: React.PropTypes.func.isRequired
        })
    },
    render(){
        var value = this.props.valueLink ? this.props.valueLink.value : this.props.value;
        return <div className="form-strlist-wrapper">
            <ul className="form-strlist-list">{
                value.map((str,i)=>{
                    return <li key={i}>
                        <span className="form-strlist-str">{str}</span>
                        <input type="button" className="form-strlist-button" value="×" onClick={this.handleDel(i)}/>
                    </li>;
                })
            }</ul>
            <div>
                <input ref="newstr" type="text" className="form-strlist-newtext" defaultValue=""/>
                <input type="button" className="form-strlist-button" value="＋" onClick={this.handleNew} />
            </div>
        </div>;
    },
    handleDel(index){
        return (e)=>{
            var props=this.props, vl;
            if(vl=props.valueLink){
                vl.requestChange(vl.value.splice(i,1));
            }else if("function"===typeof props.onChange){
                props.onChange(props.value.splice(i,1));
            }
        };
    },
    handleNew(e){
        var props=this.props, vl, txt=React.findDOMNode(this.refs.newstr);
        if(vl=props.valueLink){
            vl.requestChange(vl.value.concat(txt.value));
        }else if("function"===typeof props.onChange){
            props.onChange(props.value.concat(txt.value));
        }
        txt.value="";
    },
});
