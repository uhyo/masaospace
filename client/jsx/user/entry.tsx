import * as React from 'react';

import EntryForm from '../commons/entry-form.jsx';

export interface IPropEntry{
    config: any;
}
export default ({config}: IPropEntry)=>{
    return <section>
        <h1>新規登録</h1>
        <div className="warning">
            <p>このサービスを利用して発生したいかなる損害にも運営者はその責任を負いません。</p>
            <p>このサービスはアルファ版です。登録されたデータは予告なく変更・削除されることがあります。</p>
        </div>
        <div className="user-entry-form-wrapper">
            <EntryForm config={config} />
        </div>
    </section>;
};
