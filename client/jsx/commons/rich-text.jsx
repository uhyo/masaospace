//Rich text
var React=require('react');
var autolink=require('my-autolink');

module.exports = React.createClass({
    displayName: "RichText",
    propTypes: {
        text: React.PropTypes.string.isRequired
    },
    render(){
        const rawMarkup = this.raw();
        return <p dangerouslySetInnerHTML={rawMarkup}/>;
    },
    raw(){
        const transforms=["url",{
            pattern: ()=>{return /play\/(\d+)/g},
            transform: (_,text,num)=>{
                return {
                    href: "/play/"+num
                };
            }
        }];
        return {
            __html: autolink(this.props.text, transforms)
        };
    },
});
