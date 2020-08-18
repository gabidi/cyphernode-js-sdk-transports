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
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cypherNodeMatrixTransport = void 0;
var async_1 = require("async");
var v4_1 = __importDefault(require("uuid/v4"));
var debug_1 = __importDefault(require("debug"));
var events_1 = require("events");
var matrixUtil_1 = require("../lib/matrixUtil");
var constants_1 = require("../constants");
var cypherNodeMatrixTransport = function (_a) {
    var _b = _a.nodeDeviceId, nodeDeviceId = _b === void 0 ? "" : _b, _c = _a.nodeAccountUser, nodeAccountUser = _c === void 0 ? "" : _c, _d = _a.client, client = _d === void 0 ? matrixUtil_1.getSyncMatrixClient() : _d, _e = _a.emitter, emitter = _e === void 0 ? new events_1.EventEmitter() : _e, _f = _a.msgTimeout, msgTimeout = _f === void 0 ? 30000 : _f, _g = _a.maxMsgConcurrency, maxMsgConcurrency = _g === void 0 ? 2 : _g, _h = _a.debug, debug = _h === void 0 ? debug_1.default("sifir:transport") : _h, inboundMiddleware = _a.inboundMiddleware, outboundMiddleware = _a.outboundMiddleware;
    return __awaiter(void 0, void 0, void 0, function () {
        var matrixClient, _j, _commandQueue, _sendCommand, get, post;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    if (!inboundMiddleware || !outboundMiddleware)
                        throw "Must supply inboud and outbound message middleware";
                    if (!client.then) return [3 /*break*/, 2];
                    return [4 /*yield*/, client];
                case 1:
                    _j = _k.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _j = client;
                    _k.label = 3;
                case 3:
                    matrixClient = _j;
                    // Setup room lsner, re-emits room commands as nonce events on emitter:w
                    matrixClient.on("toDeviceEvent", function (event) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, nonce, reply;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    // // we know we only want to respond to messages
                                    if (event.getType() !== constants_1.events.COMMAND_REPLY)
                                        return [2 /*return*/];
                                    debug(constants_1.events.COMMAND_REPLY, event.getContent());
                                    return [4 /*yield*/, inboundMiddleware({
                                            event: event,
                                            nodeAccountUser: nodeAccountUser
                                        })];
                                case 1:
                                    _a = _b.sent(), nonce = _a.nonce, reply = _a.reply;
                                    emitter.emit(nonce, __assign({}, reply));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    _commandQueue = async_1.queue(function (_a, cb) { return __awaiter(void 0, void 0, void 0, function () {
                        var body, payload;
                        var _b, _c;
                        var method = _a.method, command = _a.command, param = _a.param, nonce = _a.nonce, rest = __rest(_a, ["method", "command", "param", "nonce"]);
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, outboundMiddleware(JSON.stringify(__assign({ method: method, command: command, param: param, nonce: nonce }, rest)))];
                                case 1:
                                    body = _d.sent();
                                    payload = (_b = {},
                                        _b[nodeAccountUser] = (_c = {},
                                            _c[nodeDeviceId] = {
                                                body: body
                                            },
                                            _c),
                                        _b);
                                    debug("Transport::Command queue sending", method, command, nonce, payload);
                                    return [4 /*yield*/, matrixClient.sendToDevice(constants_1.events.COMMAND_REQUEST, payload)];
                                case 2:
                                    _d.sent();
                                    cb();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, maxMsgConcurrency);
                    _sendCommand = function (_a) {
                        var method = _a.method, command = _a.command, payload = _a.payload;
                        var nonce = v4_1.default();
                        var commandPromise = new Promise(function (res, rej) {
                            var timeOut = setTimeout(function () {
                                rej({
                                    err: "Message " + nonce.slice(0, 4) + "-" + nonce.slice(-4) + " " + method + ":" + command + " timedout"
                                });
                            }, msgTimeout);
                            emitter.once(nonce, function (_a) {
                                var err = _a.err, data = __rest(_a, ["err"]);
                                clearTimeout(timeOut);
                                err ? rej({ err: err }) : res(data);
                            });
                        });
                        _commandQueue.push({
                            method: method,
                            command: command,
                            param: payload,
                            nonce: nonce
                        });
                        return commandPromise;
                    };
                    get = function (command, payload) {
                        return _sendCommand({ method: "GET", command: command, payload: payload });
                    };
                    post = function (command, payload) {
                        return _sendCommand({ method: "POST", command: command, payload: payload });
                    };
                    return [2 /*return*/, { get: get, post: post }];
            }
        });
    });
};
exports.cypherNodeMatrixTransport = cypherNodeMatrixTransport;
