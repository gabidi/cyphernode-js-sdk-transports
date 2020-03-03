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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var debug_1 = __importDefault(require("debug"));
var matrixUtil_1 = require("../lib/matrixUtil");
var constants_1 = require("../constants");
var commandBroadcaster_1 = require("../lib/commandBroadcaster");
var matrixBridge = function (_a) {
    var _b = _a.client, client = _b === void 0 ? matrixUtil_1.getSyncMatrixClient() : _b, _c = _a.bridge, bridge = _c === void 0 ? new events_1.EventEmitter() : _c, _d = _a.log, log = _d === void 0 ? debug_1.default("sifir:matrixbridge") : _d, inboundMiddleware = _a.inboundMiddleware, outboundMiddleware = _a.outboundMiddleware;
    if (!inboundMiddleware || !outboundMiddleware) {
        throw "Throw must supply outbound and inbound message processing";
    }
    var syncEmitCommand = commandBroadcaster_1.commandBroadcaster({
        source: "matrixBridge",
        bridge: bridge
    }).syncEmitCommand;
    var startBridge = function (_a) {
        var accountsPairedDeviceList = (_a === void 0 ? {} : _a).accountsPairedDeviceList;
        return __awaiter(_this, void 0, void 0, function () {
            var _client, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log("starting bridge with device account list", accountsPairedDeviceList);
                        if (!client.then) return [3 /*break*/, 2];
                        return [4 /*yield*/, client];
                    case 1:
                        _b = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = client;
                        _c.label = 3;
                    case 3:
                        _client = _b;
                        _client.on("toDeviceEvent", function (event) { return __awaiter(_this, void 0, void 0, function () {
                            var bodyToProcess, content, method, command, _a, param, nonce, rest, payload, err_1, _b, deviceId, eventSender, body_1, reply, err_2;
                            var _c, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        log("got event", event.getType(), event.getSender());
                                        if (event.getType() !== constants_1.events.COMMAND_REQUEST) {
                                            return [2 /*return*/];
                                        }
                                        _e.label = 1;
                                    case 1:
                                        _e.trys.push([1, 4, , 5]);
                                        return [4 /*yield*/, inboundMiddleware({
                                                event: event,
                                                accountsPairedDeviceList: accountsPairedDeviceList
                                            })];
                                    case 2:
                                        content = _e.sent();
                                        method = content.method, command = content.command, _a = content.param, param = _a === void 0 ? null : _a, nonce = content.nonce, rest = __rest(content, ["method", "command", "param", "nonce"]);
                                        if (!method.length || !command.length || !nonce.length)
                                            throw constants_1.processingErrors.INVALID_MSG_PAYLOAD;
                                        log("got command!", method, command);
                                        return [4 /*yield*/, syncEmitCommand(__assign({ method: method,
                                                command: command,
                                                param: param,
                                                nonce: nonce }, rest))];
                                    case 3:
                                        payload = _e.sent();
                                        bodyToProcess = JSON.stringify({ reply: payload, nonce: nonce });
                                        return [3 /*break*/, 5];
                                    case 4:
                                        err_1 = _e.sent();
                                        log("Error processing command, attempting to process error", err_1);
                                        if (err_1.message === constants_1.processingErrors.INVALID_MSG_PAYLOAD) {
                                            log("[ERROR] FAILED ! Invalid payload recieved, won't attepmt to process");
                                            return [2 /*return*/];
                                        }
                                        bodyToProcess = JSON.stringify({
                                            reply: { err: err_1 },
                                            nonce: content.nonce
                                        });
                                        return [3 /*break*/, 5];
                                    case 5:
                                        _e.trys.push([5, 8, , 9]);
                                        return [4 /*yield*/, outboundMiddleware(bodyToProcess)];
                                    case 6:
                                        _b = _e.sent(), deviceId = _b.deviceId, eventSender = _b.eventSender, body_1 = _b.body;
                                        log("Bridge sending command reply", body_1, deviceId, eventSender);
                                        reply = void 0;
                                        if (deviceId && eventSender) {
                                            reply = (_c = {},
                                                _c[eventSender] = (_d = {},
                                                    _d[deviceId] = {
                                                        body: body_1
                                                    },
                                                    _d),
                                                _c);
                                        }
                                        // If middleware does not return the deviceId and Sender, then fallback to provided list
                                        else {
                                            reply = Object.entries(accountsPairedDeviceList).reduce(function (dict, _a) {
                                                var account = _a[0], devices = _a[1];
                                                log("preparing reply to", account, devices);
                                                dict[account] = {};
                                                devices.forEach(function (device) {
                                                    dict[account][device] = { body: body_1 };
                                                });
                                                return dict;
                                            }, {});
                                        }
                                        // Send reply
                                        return [4 /*yield*/, _client.sendToDevice(constants_1.events.COMMAND_REPLY, reply)];
                                    case 7:
                                        // Send reply
                                        _e.sent();
                                        return [3 /*break*/, 9];
                                    case 8:
                                        err_2 = _e.sent();
                                        log("[ERROR] could not sendToDevice", err_2);
                                        return [3 /*break*/, 9];
                                    case 9:
                                        log("finished processing command, and sent reply");
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        log("finish starting bridge");
                        return [2 /*return*/];
                }
            });
        });
    };
    return {
        startBridge: startBridge
    };
};
exports.matrixBridge = matrixBridge;
