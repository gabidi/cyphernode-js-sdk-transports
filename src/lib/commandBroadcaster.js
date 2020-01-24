"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commandBroadcaster = function (_a) {
    var _b = _a === void 0 ? {} : _a, source = _b.source, bridge = _b.bridge, _c = _b.timeoutMs, timeoutMs = _c === void 0 ? 3000 : _c;
    if (!bridge)
        "Must init commandBroadcaster with event emitter as bridge";
    if (!source)
        "Must init commandBroadcaster with source";
    var syncEmitCommand = function (_a) {
        var command = _a.command, method = _a.method, param = _a.param, nonce = _a.nonce;
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
        bridge.emit("sifirBridgeCommand", {
            source: source,
            command: command,
            method: method,
            param: param,
            nonce: nonce
        });
        return replyPromise;
    };
    return { syncEmitCommand: syncEmitCommand };
};
exports.commandBroadcaster = commandBroadcaster;
