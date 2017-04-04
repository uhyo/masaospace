//StrList（フォーム要素的な）
import * as React from 'react';

export interface IPropStrList{
    value: Array<string>;
    onChange(value: Array<string>): void;
}
export default class StrList extends React.Component<IPropStrList, {}>{
    render(){
        const {
            value,
            onChange,
        } = this.props;
        const handleDel = (index: number)=>{
            return ()=>{
                if ('function' === typeof onChange){
                    onChange([
                        ...(value.slice(0, index)),
                        ...(value.slice(index+1)),
                    ]);
                }
            };
        };
        const handleNew = ()=>{
            const txt = this.refs['newstr'] as HTMLInputElement;
            const newval = txt.value;
            if(!newval){
                return;
            }
            if ('function' === typeof onChange){
                onChange([
                    ...value,
                    newval,
                ]);
            }
            txt.value='';
        };
        return <div className="form-strlist-wrapper">
            <ul className="form-strlist-list">{
                value.map((str,i)=>{
                    return <li key={i}>
                        <span className="form-strlist-str">{str}</span>
                        <input type="button" className="form-strlist-button" value="×" onClick={handleDel(i)}/>
                    </li>;
                })
            }</ul>
            <div>
            <input ref="newstr" type="text" className="form-strlist-newtext" defaultValue=""/>
            <input type="button" className="form-strlist-button" value="＋" onClick={handleNew} />
            </div>
        </div>;
    }
}

