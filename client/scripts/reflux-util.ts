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

    listen(callback: (state: T)=>void): void;
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
interface RefluxComponentClass{
    new<P, S>(props: P): IRefluxComponent<P, S>
}
interface IRefluxComponent<P, S> extends React.Component<P, S>{
}
const _RefluxComponent = Reflux.Component as RefluxComponentClass;

export class RefluxComponent<D, P, S> extends _RefluxComponent<P, S & D>{
    constructor(props: P, definition: {[K in keyof D]: Store<D[K]>}){
        super(props);

        const initialState: any = {};
        for (let key in definition){
            const store = definition[key];
            initialState[key] = store.state;
            store.listen(state =>{
                this.setState({
                    [key]: state,
                } as any);
            });
        }

        this.state = initialState;
    }
}
