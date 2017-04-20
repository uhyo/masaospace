// my lib. to handle Reflux
import * as React from 'react';
import * as Promise from 'native-promise-only';
const Reflux: any = require('reflux');
const RefluxPromise = require('reflux-promise');

// plugin
Reflux.use(RefluxPromise(Promise));

// ========== Actions ==========
export interface Action<T>{
    (arg: T): void;
    listen(callback: (arg: T)=>void): void;
}
export interface ActionDefinition<T>{
    asyncResult?: boolean;
    preEmit?(obj: T): T | undefined;
    shouldEmit?(obj: T): boolean;
}
// Async
export interface AsyncAction<T, R> extends Action<T>{
    completed: Action<R>;
    failed: Action<Error>;
    promise(p: Promise<R>): void;
}

export function createAction<T>(definition?: ActionDefinition<T>): Action<T>{
    return Reflux.createAction(definition);
}

export function createAsyncAction<T, R>(definition?: ActionDefinition<T>): AsyncAction<T, R>{
    return Reflux.createAction(definition ? {
        asyncResult: true,
        ...definition,
    } : {
        asyncResult: true,
    });
}

export function createActions<D>(definitions: {[K in keyof D]: ActionDefinition<D[K]>}): {[K in keyof D]: Action<D[K]>}{
    return (Reflux.createActions as any)(definitions);
}

// ========== Stores ==========
export interface StoreObject<T>{
    state: T;
    trigger(state: T): void;
    listenables: any;
    listenTo<U>(action: Action<U>, callback: (act: U)=>void): void;
    listenToMany(actions: any): void;

    listen(callback: (state: T)=>void): ()=>void;
}
export interface StoreClass{
    new<T>(): StoreObject<T>;
}
const RefluxStore = Reflux.Store as StoreClass;
export class Store<T> extends RefluxStore<T>{
    // stateを更新してpublish
    protected setState(obj: Partial<T>){
        this.state = {
            ...(this.state as any),
            ...(obj as any),
        };
        this.trigger(this.state);
    }
}

export interface StoreDefinition{
    init?(): void;
}
export function createStore<T>(definition: StoreDefinition): StoreObject<T>{
    return (Reflux as any).createStore(definition);
}

// ========= Components ==========
export class RefluxComponent<D, P, S> extends React.Component<P, S & D>{
    protected unlistens: Array<()=>void> = [];
    constructor(props: P, protected definition: {[K in keyof D]: Store<D[K]>}){
        super(props);

        const initialState: any = {};
        for (const key in definition){
            const store = definition[key];
            initialState[key] = store.state;
        }

        this.state = initialState;
    }
    componentDidMount(){
        // listen to stores
        for (const key in this.definition){
            const store = this.definition[key];
            const unlisten = store.listen(state =>{
                this.setState({
                    [key]: state,
                } as any);
            });
            this.unlistens.push(unlisten);
        }
    }
    componentWillUnmount(){
        // unlisten
        for (const unlisten of this.unlistens){
            unlisten();
        }
        this.unlistens = [];
    }
}
