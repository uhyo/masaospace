var React = require('react');

module.exports = React.createClass({
    displayName:"Datetime",
    propTypes:{
        date:React.PropTypes.instanceOf(Date).isRequired
    },
    render(){
        var date=this.props.date;
        var isostr=date.toJSON(),
            viewstr=this.viewstr(date);
        return <time dateTime={isostr}>{viewstr}</time>;
    },
    viewstr(date){
        return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日　${this.zero2(date.getHours())}:${this.zero2(date.getMinutes())}`;
    },
    zero2(num){
        return `0${num}`.slice(-2);
    }
});
