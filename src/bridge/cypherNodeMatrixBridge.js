"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
// FIXME update this on next cyphernode sdk release
var cyphernode_js_sdk_1 = require("cyphernode-js-sdk");
var debug_1 = __importDefault(require("debug"));
var matrixUtil_1 = require("../lib/matrixUtil");
var constants_1 = require("../constants");
var debug = debug_1.default("sifir:bridge");
var cypherNodeMatrixBridge = function (_a) {
    var _b = _a.client, client = _b === void 0 ? matrixUtil_1.getSyncMatrixClient() : _b, _c = _a.transport, transport = _c === void 0 ? cyphernode_js_sdk_1.cypherNodeHttpTransport() : _c, inboundMiddleware = _a.inboundMiddleware, outboundMiddleware = _a.outboundMiddleware;
    if (!inboundMiddleware || !outboundMiddleware) {
        throw "Throw must supply outbound and inbound message processing";
    }
    var startBridge = function (_a) {
        var accountsPairedDeviceList = _a.accountsPairedDeviceList;
        return __awaiter(_this, void 0, void 0, function () {
            var get, post, _client, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!accountsPairedDeviceList)
                            throw "cannot start birding wihtout list of paired devices";
                        debug("starting bridge", accountsPairedDeviceList);
                        get = transport.get, post = transport.post;
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
                            var reply, content, method, command, _a, param, nonce, payload, _b, body_1, err_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        debug("got event", event.getType(), event.getSender());
                                        if (event.getType() !== constants_1.events.COMMAND_REQUEST) {
                                            return [2 /*return*/];
                                        }
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 10, , 11]);
                                        return [4 /*yield*/, inboundMiddleware({
                                                event: event,
                                                accountsPairedDeviceList: accountsPairedDeviceList
                                            })];
                                    case 2:
                                        content = _c.sent();
                                        method = content.method, command = content.command, _a = content.param, param = _a === void 0 ? null : _a, nonce = content.nonce;
                                        if (!method.length || !command.length || !nonce.length)
                                            throw "Invalid event content parsed";
                                        debug("got command!", method, command);
                                        payload = void 0;
                                        _b = method;
                                        switch (_b) {
                                            case "GET": return [3 /*break*/, 3];
                                            case "POST": return [3 /*break*/, 5];
                                        }
                                        return [3 /*break*/, 7];
                                    case 3:
                                        debug("processing get", command);
                                        return [4 /*yield*/, get(command, param)];
                                    case 4:
                                        payload = _c.sent();
                                        return [3 /*break*/, 8];
                                    case 5:
                                        debug("processing post", command);
                                        return [4 /*yield*/, post(command, param)];
                                    case 6:
                                        payload = _c.sent();
                                        return [3 /*break*/, 8];
                                    case 7:
                                        console.error("Unknown command method", method, command);
                                        return [2 /*return*/];
                                    case 8:
                                        body_1 = JSON.stringify({ reply: payload, nonce: nonce });
                                        return [4 /*yield*/, outboundMiddleware(body_1)];
                                    case 9:
                                        body_1 = _c.sent();
                                        reply = Object.entries(accountsPairedDeviceList).reduce(function (dict, _a) {
                                            var account = _a[0], devices = _a[1];
                                            debug("preparing reply to", account, devices);
                                            dict[account] = {};
                                            devices.forEach(function (device) {
                                                dict[account][device] = { body: body_1 };
                                            });
                                            return dict;
                                        }, {});
                                        return [3 /*break*/, 11];
                                    case 10:
                                        err_1 = _c.sent();
                                        debug("Error sending command to transport", err_1);
                                        reply = { err: err_1 };
                                        return [3 /*break*/, 11];
                                    case 11:
                                        debug("Bridge sending command reply", reply);
                                        return [4 /*yield*/, _client.sendToDevice(constants_1.events.COMMAND_REPLY, reply)];
                                    case 12:
                                        _c.sent();
                                        //const devicesConnected = await _client.getDevices();
                                        //const accountMessages = devicesConnected.devices.reduce(
                                        //  (payload, { device_id }) => {
                                        //    payload[device_id] = {
                                        //      body: JSON.stringify({ reply, nonce }),
                                        //      msgtype: events.COMMAND_REQUEST
                                        //    };
                                        //    return payload;
                                        //  },
                                        //  {}
                                        //);
                                        //const devicesConnected = await _client.getDevices();
                                        //const accountMessages = devicesConnected.devices.reduce(
                                        //  (payload, { device_id }) => {
                                        //    payload[device_id] = {
                                        //      body: JSON.stringify({ reply, nonce }),
                                        //      msgtype: events.COMMAND_REQUEST
                                        //    };
                                        //    return payload;
                                        //  },
                                        //  {}
                                        //);
                                        //debug("sending reply to", nonce, reply, accountMessages);
                                        //await _client.sendToDevice(
                                        //  events.COMMAND_REPLY,
                                        //  {
                                        //    [nodeAccountUser]: accountMessages
                                        //  },
                                        //  nonce
                                        //);
                                        debug("finished processing command");
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        debug("finish starting bridge");
                        return [2 /*return*/];
                }
            });
        });
    };
    return {
        startBridge: startBridge
    };
};
exports.cypherNodeMatrixBridge = cypherNodeMatrixBridge;
