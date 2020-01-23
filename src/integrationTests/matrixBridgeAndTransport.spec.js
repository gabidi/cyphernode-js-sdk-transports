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
/**
 * FIXME THIS DOESNT WORK WITH NEW INFRA RE_WRTE
 */
var ava_1 = require("ava");
var cyphernode_js_sdk_1 = require("cyphernode-js-sdk");
var cypherNodeMatrixBridge_1 = require("../bridge/cypherNodeMatrixBridge");
var cyphernodeMatrixTransport_1 = require("../transports/cyphernodeMatrixTransport");
var matrixUtil_1 = require("../lib/matrixUtil");
var sinon_1 = __importDefault(require("sinon"));
var test = ava_1.serial; //FIXME this bullshit, interface for Matrix
test.before(function (t) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        t.context = {
            getSyncMatrixClient: matrixUtil_1.getSyncMatrixClient,
            apiKey: process.env.CYPHERNODE_API_KEY,
            baseUrl: process.env.SIFIR_MATRIX_SERVER,
            password: process.env.SIFIR_MATRIX_PASS,
            user: process.env.SIFIR_MATRIX_USER,
            phoneUser: process.env.SIFIR_PHONE_MATRIX_USER,
            phoneUserPassword: process.env.SIFIR_PHONE_MATRIX_PASS
        };
        return [2 /*return*/];
    });
}); });
test("Should be able to send message to devices directly", function (t) { return __awaiter(_this, void 0, void 0, function () {
    var _a, baseUrl, getSyncMatrixClient, apiKey, user, password, nodeDeviceId, clientId, bridgeInboundMiddleware, bridgeOutboundMiddleware, serverMatrixClient, startBridge, transportInboundmiddleware, transportOutboundmiddleware, transportMatrixClient, transport, btcClient, hash;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = t.context, baseUrl = _a.baseUrl, getSyncMatrixClient = _a.getSyncMatrixClient, apiKey = _a.apiKey, user = _a.user, password = _a.password;
                nodeDeviceId = "myCyphernode";
                clientId = "myPhone";
                bridgeInboundMiddleware = function (_a) {
                    var event = _a.event, accountsPairedDeviceList = _a.accountsPairedDeviceList;
                    var eventSender = event.getSender();
                    t.is(eventSender, user);
                    t.true(Object.keys(accountsPairedDeviceList).includes(eventSender));
                    var content = event.getContent();
                    return JSON.parse(content.body);
                };
                bridgeOutboundMiddleware = sinon_1.default.stub().resolvesArg(0);
                return [4 /*yield*/, getSyncMatrixClient({
                        baseUrl: baseUrl,
                        password: password,
                        user: user,
                        deviceId: nodeDeviceId
                    })];
            case 1:
                serverMatrixClient = _c.sent();
                startBridge = cypherNodeMatrixBridge_1.cypherNodeMatrixBridge({
                    transport: cyphernode_js_sdk_1.cypherNodeHttpTransport(),
                    client: serverMatrixClient,
                    inboundMiddleware: bridgeInboundMiddleware,
                    outboundMiddleware: bridgeOutboundMiddleware
                }).startBridge;
                return [4 /*yield*/, startBridge({
                        accountsPairedDeviceList: (_b = {},
                            _b[user] = [clientId],
                            _b)
                    })];
            case 2:
                _c.sent();
                transportInboundmiddleware = function (_a) {
                    var event = _a.event, nodeAccountUser = _a.nodeAccountUser;
                    t.true(event.getSender() === nodeAccountUser);
                    var _b = event.getContent(), body = _b.body, msgtype = _b.msgtype;
                    var _c = JSON.parse(body), nonce = _c.nonce, reply = _c.reply;
                    return { nonce: nonce, reply: reply };
                };
                transportOutboundmiddleware = sinon_1.default.stub().resolvesArg(0);
                return [4 /*yield*/, getSyncMatrixClient({
                        baseUrl: baseUrl,
                        password: password,
                        user: user,
                        deviceId: clientId
                    })];
            case 3:
                transportMatrixClient = _c.sent();
                return [4 /*yield*/, cyphernodeMatrixTransport_1.cypherNodeMatrixTransport({
                        nodeAccountUser: user,
                        nodeDeviceId: nodeDeviceId,
                        client: transportMatrixClient,
                        msgTimeout: 1200000,
                        inboundMiddleware: transportInboundmiddleware,
                        outboundMiddleware: transportOutboundmiddleware
                    })];
            case 4:
                transport = _c.sent();
                btcClient = cyphernode_js_sdk_1.btcClient({ transport: transport });
                return [4 /*yield*/, btcClient.getBestBlockHash()];
            case 5:
                hash = _c.sent();
                t.true(transportOutboundmiddleware.calledOnce);
                t.true(bridgeOutboundMiddleware.calledOnce);
                t.true(!!hash.length);
                return [2 /*return*/];
        }
    });
}); });
