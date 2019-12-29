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
var v4_1 = __importDefault(require("uuid/v4"));
var debug_1 = __importDefault(require("debug"));
var matrixUtil_1 = require("../lib/matrixUtil");
var constants_1 = require("../constants");
var verifyEvents_1 = require("../lib/helper/verifyEvents");
var cypherNodeMatrixBridge = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.client, client = _c === void 0 ? matrixUtil_1.getSyncMatrixClient() : _c, _d = _b.transport, transport = _d === void 0 ? cyphernode_js_sdk_1.cypherNodeHttpTransport() : _d, _e = _b.log, log = _e === void 0 ? debug_1.default("sifir:bridge") : _e, _f = _b.approvedRoomList, approvedRoomList = _f === void 0 ? [] : _f, _g = _b.approvedUserList, approvedUserList = _g === void 0 ? [] : _g, _h = _b.approvedDeviceList, approvedDeviceList = _h === void 0 ? [] : _h;
    var inviteUserToNewRoom = function (user, device) { return __awaiter(_this, void 0, void 0, function () {
        var _client, _a, _room, serverRoom;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!user)
                        throw "Cannot start room bridge without user to invite";
                    if (!client.then) return [3 /*break*/, 2];
                    return [4 /*yield*/, client];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = client;
                    _b.label = 3;
                case 3:
                    _client = _a;
                    return [4 /*yield*/, _client.createRoom({
                            invite: [user],
                            visibility: "private",
                            name: "cyphernode-" + v4_1.default(),
                            room_alias_name: "cyphernode-" + v4_1.default()
                        })];
                case 4:
                    _room = _b.sent();
                    return [4 /*yield*/, _client.joinRoom(_room.room_id)];
                case 5:
                    serverRoom = _b.sent();
                    log("bridge created and joined new room", serverRoom.roomId);
                    approvedRoomList.push(_room.room_id);
                    approvedUserList.push(user);
                    approvedDeviceList.push(device);
                    return [2 /*return*/, serverRoom];
            }
        });
    }); };
    /**
     * Starts the bridge and returns the private roomId the user needs to join
     */
    var startBridge = function () { return __awaiter(_this, void 0, void 0, function () {
        var get, post, _client, _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    get = transport.get, post = transport.post;
                    if (!client.then) return [3 /*break*/, 2];
                    return [4 /*yield*/, client];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = client;
                    _b.label = 3;
                case 3:
                    _client = _a;
                    if (!_client.isCryptoEnabled())
                        throw "Crypto not enabled on client with required encryption flag set";
                    _client.on("Event.decrypted", function (event) { return __awaiter(_this, void 0, void 0, function () {
                        var err_1, _a, nonce, method, command, _b, param, reply, _c, error_1;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    // _client.on("Room.timeline", async function(event, room, toStartOfTimeline) {
                                    // make sure room is in list of approved rooms
                                    if (!approvedRoomList.includes(event.getRoomId()))
                                        return [2 /*return*/];
                                    // make sure user sending message is in approved
                                    // We check autneticitiy of user in abit
                                    if (!approvedUserList.includes(event.getSender()))
                                        return [2 /*return*/];
                                    // make sure it's not an echo of our own message
                                    if (event.getSender() === _client.getUserId())
                                        return [2 /*return*/];
                                    // Check encryption
                                    if (!event.isEncrypted()) {
                                        log("[ERROR] Recieved unencrypted commmand reply with encryptedOnly flag on!", event.getType(), event.getContent());
                                        return [2 /*return*/];
                                    }
                                    // event.once("Event.decrypted", async () => {
                                    log("decrypted event", event.getSender(), event.getContent());
                                    // we are only intested in cyphernode.commnads for our room
                                    if (event.getContent().msgtype !== constants_1.events.COMMAND_REQUEST)
                                        return [2 /*return*/];
                                    _d.label = 1;
                                case 1:
                                    _d.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, verifyEvents_1.verifyEventSenderIsTrusted(_client, event, approvedDeviceList)];
                                case 2:
                                    _d.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_1 = _d.sent();
                                    log("error validating event sender trust", err_1);
                                    return [2 /*return*/];
                                case 4:
                                    _a = JSON.parse(
                                    // note only body is JSON string
                                    event.getContent().body), nonce = _a.nonce, method = _a.method, command = _a.command, _b = _a.param, param = _b === void 0 ? null : _b;
                                    _d.label = 5;
                                case 5:
                                    _d.trys.push([5, 12, , 13]);
                                    _c = method;
                                    switch (_c) {
                                        case "GET": return [3 /*break*/, 6];
                                        case "POST": return [3 /*break*/, 8];
                                    }
                                    return [3 /*break*/, 10];
                                case 6:
                                    log("processing get", command);
                                    return [4 /*yield*/, get(command, param)];
                                case 7:
                                    reply = _d.sent();
                                    return [3 /*break*/, 11];
                                case 8:
                                    log("processing post", command);
                                    return [4 /*yield*/, post(command, param)];
                                case 9:
                                    reply = _d.sent();
                                    return [3 /*break*/, 11];
                                case 10:
                                    console.error("Unknown command method", method);
                                    return [2 /*return*/];
                                case 11: return [3 /*break*/, 13];
                                case 12:
                                    error_1 = _d.sent();
                                    log("Error sending command to transport", error_1);
                                    reply = { error: error_1 };
                                    return [3 /*break*/, 13];
                                case 13:
                                    log("send Event", nonce, reply);
                                    return [4 /*yield*/, _client.sendEvent(event.getRoomId(), constants_1.events.COMMAND_REPLY, {
                                            body: JSON.stringify({ nonce: nonce, reply: reply }),
                                            msgtype: constants_1.events.COMMAND_REPLY
                                        })];
                                case 14:
                                    _d.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    log("finish starting bridge");
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        startBridge: startBridge,
        inviteUserToNewRoom: inviteUserToNewRoom
    };
};
exports.cypherNodeMatrixBridge = cypherNodeMatrixBridge;
