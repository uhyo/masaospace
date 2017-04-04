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
exports.__esModule = true;
var reflux_util_1 = require("../scripts/reflux-util");
var userAction = require('../actions/user');
var emitError = reflux_util_1.createAction();
var ErrorStore = (function (_super) {
    __extends(ErrorStore, _super);
    function ErrorStore() {
        var _this = _super.call(this) || this;
        _this.state = {
            logs: []
        };
        var se = _this.someError.bind(_this);
        _this.listenTo(emitError, se);
        _this.listenTo(userAction.login.failed, se);
        _this.listenTo(userAction.logout.failed, se);
        _this.listenTo(userAction.update.failed, se);
        return _this;
    }
    ErrorStore.prototype.someError = function (err) {
        console.error(err);
        this.setState({
            logs: this.state.logs.concat(String(err))
        });
    };
    ErrorStore.prototype.reset = function () {
        this.setState({
            logs: []
        });
    };
    ErrorStore.prototype.emit = function (err) {
        emitError(err);
    };
    return ErrorStore;
}(reflux_util_1.Store));
exports.ErrorStore = ErrorStore;
exports["default"] = new ErrorStore();
