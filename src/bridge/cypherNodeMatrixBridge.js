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
var cypherNodeMatrixBridge = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.nodeAccountUser, nodeAccountUser = _c === void 0 ? "" : _c, _d = _b.client, client = _d === void 0 ? matrixUtil_1.getSyncMatrixClient() : _d, _e = _b.transport, transport = _e === void 0 ? cyphernode_js_sdk_1.cypherNodeHttpTransport() : _e, _f = _b.log, log = _f === void 0 ? debug_1.default("sifir:transport") : _f;
    var startBridge = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.acceptVerifiedDeviceOnly, acceptVerifiedDeviceOnly = _c === void 0 ? true : _c, _d = _b.acceptEncryptedEventsOnly, acceptEncryptedEventsOnly = _d === void 0 ? true : _d;
        return __awaiter(_this, void 0, void 0, function () {
            var get, post, _client, _e;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        log("starting bridge");
                        get = transport.get, post = transport.post;
                        if (!client.then) return [3 /*break*/, 2];
                        return [4 /*yield*/, client];
                    case 1:
                        _e = _f.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _e = client;
                        _f.label = 3;
                    case 3:
                        _client = _e;
                        if (acceptEncryptedEventsOnly && !_client.isCryptoEnabled())
                            throw "Crypto not enabled on client with required encryption flag set";
                        _client.on("toDeviceEvent", function (event) { return __awaiter(_this, void 0, void 0, function () {
                            var content, _a, method, command, _b, param, nonce, reply, _c, error_1, devicesConnected, accountMessages;
                            var _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        log("got event", event.getType(), event.getSender());
                                        if (event.getType() !== constants_1.events.COMMAND_REQUEST) {
                                            return [2 /*return*/];
                                        }
                                        if (event.getSender() !== nodeAccountUser) {
                                            // TODO should send message to user phone in this cas
                                            console.error("Got command from a different account!");
                                            return [2 /*return*/];
                                        }
                                        content = event.getContent();
                                        log("got command!", content);
                                        _a = JSON.parse(content.body), method = _a.method, command = _a.command, _b = _a.param, param = _b === void 0 ? null : _b, nonce = _a.nonce;
                                        _e.label = 1;
                                    case 1:
                                        _e.trys.push([1, 8, , 9]);
                                        _c = method;
                                        switch (_c) {
                                            case "GET": return [3 /*break*/, 2];
                                            case "POST": return [3 /*break*/, 4];
                                        }
                                        return [3 /*break*/, 6];
                                    case 2:
                                        log("processing get", command);
                                        return [4 /*yield*/, get(command, param)];
                                    case 3:
                                        reply = _e.sent();
                                        return [3 /*break*/, 7];
                                    case 4:
                                        log("processing post", command);
                                        return [4 /*yield*/, post(command, param)];
                                    case 5:
                                        reply = _e.sent();
                                        return [3 /*break*/, 7];
                                    case 6:
                                        console.error("Unknown command method", method);
                                        return [2 /*return*/];
                                    case 7: return [3 /*break*/, 9];
                                    case 8:
                                        error_1 = _e.sent();
                                        log("Error sending command to transport", error_1);
                                        reply = { error: error_1 };
                                        return [3 /*break*/, 9];
                                    case 9: return [4 /*yield*/, _client.getDevices()];
                                    case 10:
                                        devicesConnected = _e.sent();
                                        accountMessages = devicesConnected.devices.reduce(function (payload, _a) {
                                            var device_id = _a.device_id;
                                            payload[device_id] = {
                                                body: JSON.stringify({ reply: reply, nonce: nonce }),
                                                msgtype: constants_1.events.COMMAND_REQUEST
                                            };
                                            return payload;
                                        }, {});
                                        log("sending reply to", nonce, reply, accountMessages);
                                        return [4 /*yield*/, _client.sendToDevice(constants_1.events.COMMAND_REPLY, (_d = {},
                                                _d[nodeAccountUser] = accountMessages,
                                                _d), nonce)];
                                    case 11:
                                        _e.sent();
                                        log("finished processing command");
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
exports.cypherNodeMatrixBridge = cypherNodeMatrixBridge;
