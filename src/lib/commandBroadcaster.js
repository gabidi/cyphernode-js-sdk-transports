"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var commandBroadcaster = function (_a) {
    var _b = _a === void 0 ? {} : _a, source = _b.source, bridge = _b.bridge, _c = _b.timeoutMs, timeoutMs = _c === void 0 ? process.env.BRIDGE_COMMAND_BROADCAST_TIMEOUT || 3000 : _c;
    if (!bridge)
        "Must init commandBroadcaster with event emitter as bridge";
    if (!source)
        "Must init commandBroadcaster with source";
    var syncEmitCommand = function (_a) {
        var command = _a.command, method = _a.method, param = _a.param, nonce = _a.nonce, rest = __rest(_a, ["command", "method", "param", "nonce"]);
        var replyPromise = new Promise(function (res, rej) {
            var timeout = setTimeout(function () { return rej(command + "/" + method + " with " + nonce + " timedout!"); }, timeoutMs);
            bridge.once(nonce, function (payload) {
                clearTimeout(timeout);
                var err = payload.err;
                if (err)
                    rej({ err: err });
                else
                    res(payload);
            });
        });
        bridge.emit("sifirBridgeCommand", __assign({ source: source,
            command: command,
            method: method,
            param: param,
            nonce: nonce }, rest));
        return replyPromise;
    };
    return { syncEmitCommand: syncEmitCommand };
};
exports.commandBroadcaster = commandBroadcaster;
