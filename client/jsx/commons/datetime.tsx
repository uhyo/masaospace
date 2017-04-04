import * as React from 'react';

export default ({date}: {date: Date})=>{
    const isostr = date.toJSON();
    const str = viewstr(date);
    return <time dateTime={isostr}>{str}</time>;
};
function viewstr(date: Date){
    return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日　${zero2(date.getHours())}:${zero2(date.getMinutes())}`;
}
function zero2(num: number){
    return `0${num}`.slice(-2);
}
