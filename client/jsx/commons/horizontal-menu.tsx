//横にならぶmenu

import * as React from 'react';

export interface IPropHorizontalMenu{
    contents: Array<{
        id: string;
        name: string;
    }>;
    page: string;
    onChange?(id: string): void;
}
export default function HorizontalMenu({contents, page, onChange}: IPropHorizontalMenu){
    const clickHandler = (id: string)=>{
        return (e: React.MouseEvent<HTMLElement>)=>{
            e.preventDefault();
            if(onChange != null){
                onChange(id);
            }
        };
    };
    return <ul className="horizontal-menu">{
        contents.map(({id,name})=>{
            const className = page===id ? "horizontal-menu-current" : void 0;
            return <li key={id} className={className} onClick={clickHandler(id)}>{name}</li>;
        })
    }</ul>;
}
