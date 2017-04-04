import * as React from 'react';
// HTMLInputからvalueを取得
export function getValue<P, S>(component: React.Component<P, S>, name: string): string{
    const elm = component.refs[name] as HTMLInputElement;
    return elm.value;
}
