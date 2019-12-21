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
var ava_1 = require("ava");
var cyphernode_js_sdk_1 = require("cyphernode-js-sdk");
var cypherNodeMatrixBridge_1 = require("../bridge/cypherNodeMatrixBridge");
var cyphernodeMatrixTransport_1 = require("../transports/cyphernodeMatrixTransport");
var matrixUtil_1 = require("../lib/matrixUtil");
var debug_1 = __importDefault(require("debug"));
var log = debug_1.default("sifir:test");
var test = ava_1.serial; //FIXME this bullshit, interface for Matrix
test.before(function (t) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        t.context = {
            getSyncMatrixClient: matrixUtil_1.getSyncMatrixClient,
            apiKey: process.env.CYPHERNODE_API_KEY,
            baseUrl: process.env.CYPHERNODE_MATRIX_SERVER,
            password: process.env.CYPHERNODE_MATRIX_PASS,
            user: process.env.CYPHERNODE_MATRIX_USER,
            phoneUser: "@e684968c440ba877d73d8ff62bae31277f8c0279:matrix.sifir.io",
            phoneUserPassword: "daYw5a7Mwv3nywXOU+67avsrsNySW5EdIEkIupt3vwY"
        };
        return [2 /*return*/];
    });
}); });
test("Should be able to route an e2e message from client transport to lsning bridge", function (t) { return __awaiter(_this, void 0, void 0, function () {
    var _a, baseUrl, getSyncMatrixClient, apiKey, user, password, phoneUser, phoneUserPassword, nodeDeviceId, serverMatrixClient, startBridge, clientId, roomId, transportMatrixClient, transport, serverVerifyPromise, phoneVerifier, btcClient, hash, balance;
    var _this = this;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context, baseUrl = _a.baseUrl, getSyncMatrixClient = _a.getSyncMatrixClient, apiKey = _a.apiKey, user = _a.user, password = _a.password, phoneUser = _a.phoneUser, phoneUserPassword = _a.phoneUserPassword;
                nodeDeviceId = "bridge";
                return [4 /*yield*/, getSyncMatrixClient({
                        baseUrl: baseUrl,
                        password: password,
                        user: user,
                        deviceId: nodeDeviceId
                    })];
            case 1:
                serverMatrixClient = _b.sent();
                startBridge = cypherNodeMatrixBridge_1.cypherNodeMatrixBridge({
                    transport: cyphernode_js_sdk_1.cypherNodeHttpTransport(),
                    client: serverMatrixClient
                }).startBridge;
                clientId = "client";
                return [4 /*yield*/, startBridge({
                        inviteUser: phoneUser
                    })];
            case 2:
                roomId = _b.sent();
                return [4 /*yield*/, getSyncMatrixClient({
                        baseUrl: baseUrl,
                        password: phoneUserPassword,
                        user: phoneUser,
                        deviceId: clientId
                    })];
            case 3:
                transportMatrixClient = _b.sent();
                return [4 /*yield*/, cyphernodeMatrixTransport_1.cypherNodeMatrixTransport({
                        roomId: roomId,
                        client: transportMatrixClient,
                        msgTimeout: 18000
                    })];
            case 4:
                transport = _b.sent();
                // Verify devices
                serverMatrixClient.setGlobalBlacklistUnverifiedDevices(true);
                transportMatrixClient.setGlobalBlacklistUnverifiedDevices(true);
                serverVerifyPromise = new Promise(function (res, rej) {
                    serverMatrixClient.on("Room.timeline", function (e) { return __awaiter(_this, void 0, void 0, function () {
                        var content, serverVerifier;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    content = e.getContent();
                                    if (!content || content.msgtype !== "m.key.verification.request")
                                        return [2 /*return*/];
                                    if (content.to !== serverMatrixClient.getUserId())
                                        return [2 /*return*/];
                                    log("got request", content, content.msgtype);
                                    serverVerifier = serverMatrixClient.acceptVerificationDM(e, matrixUtil_1.verificationMethods.SAS);
                                    serverVerifier.on("show_sas", function (e) {
                                        e.confirm();
                                    });
                                    return [4 /*yield*/, serverVerifier.verify()];
                                case 1:
                                    _a.sent();
                                    res();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
                return [4 /*yield*/, transportMatrixClient.requestVerificationDM(user, roomId, [matrixUtil_1.verificationMethods.SAS])];
            case 5:
                phoneVerifier = _b.sent();
                phoneVerifier.on("show_sas", function (r) {
                    r.confirm();
                });
                return [4 /*yield*/, Promise.all([phoneVerifier.verify(), serverVerifyPromise])];
            case 6:
                _b.sent();
                // Encrypt room and wait for conifmrionat
                return [4 /*yield*/, serverMatrixClient.setRoomEncryption(roomId, {
                        algorithm: "m.megolm.v1.aes-sha2"
                    })];
            case 7:
                // Encrypt room and wait for conifmrionat
                _b.sent();
                return [4 /*yield*/, transportMatrixClient.setRoomEncryption(roomId, {
                        algorithm: "m.megolm.v1.aes-sha2"
                    })];
            case 8:
                _b.sent();
                btcClient = cyphernode_js_sdk_1.btcClient({ transport: transport });
                return [4 /*yield*/, btcClient.getBestBlockHash()];
            case 9:
                hash = _b.sent();
                t.true(!!hash.length);
                return [4 /*yield*/, btcClient.getBalance()];
            case 10:
                balance = _b.sent();
                t.true(!isNaN(balance));
                return [2 /*return*/];
        }
    });
}); });
