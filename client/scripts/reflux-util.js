"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var Reflux = require('reflux');
function createAction(definition) {
    return Reflux.createAction(definition);
}
exports.createAction = createAction;
function createAsyncAction(definition) {
    return Reflux.createAction(definition ? __assign({ asyncResult: true }, definition) : {
        asyncResult: true
    });
}
exports.createAsyncAction = createAsyncAction;
function createActions(definitions) {
    return Reflux.createActions(definitions);
}
exports.createActions = createActions;
var RefluxStore = Reflux.Store;
var Store = (function (_super) {
    __extends(Store, _super);
    function Store() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // stateを更新してpublish
    Store.prototype.setState = function (obj) {
        this.state = __assign({}, this.state, obj);
        this.trigger(this.state);
    };
    return Store;
}(RefluxStore));
exports.Store = Store;
function createStore(definition) {
    return Reflux.createStore(definition);
}
exports.createStore = createStore;
var _RefluxComponent = Reflux.Component;
var RefluxComponent = (function (_super) {
    __extends(RefluxComponent, _super);
    function RefluxComponent(props, definition) {
        var _this = _super.call(this, props) || this;
        var initialState = {};
        var _loop_1 = function (key) {
            var store = definition[key];
            initialState[key] = store.state;
            store.listen(function (state) {
                _this.setState((_a = {},
                    _a[key] = state,
                    _a));
                var _a;
            });
        };
        for (var key in definition) {
            _loop_1(key);
        }
        _this.state = initialState;
        return _this;
    }
    return RefluxComponent;
}(_RefluxComponent));
exports.RefluxComponent = RefluxComponent;
