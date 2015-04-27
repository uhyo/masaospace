///<reference path="./node.d.ts" />
var randomString = require('random-string');
//some utils
function uniqueToken(length) {
    //2057年くらいまではDate.now().toString(36)は8桁
    if (length <= 8) {
        return Date.now().toString(36).slice(-length);
    }
    else {
        return randomString({ length: length - 8 }) + Date.now().toString(36).slice(-8);
    }
}
exports.uniqueToken = uniqueToken;
