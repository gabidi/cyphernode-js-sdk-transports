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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var olm_1 = __importDefault(require("./olm/package/olm"));
// This is poop but a current requirement for matrix js sdk
global.Olm = olm_1.default;
var matrix_js_sdk_1 = __importStar(require("matrix-js-sdk"));
exports.MatrixClient = matrix_js_sdk_1.MatrixClient;
exports.MatrixEvent = matrix_js_sdk_1.MatrixEvent;
var crypto_1 = require("matrix-js-sdk/lib/crypto");
exports.verificationMethods = crypto_1.verificationMethods;
var debug_1 = __importDefault(require("debug"));
// FIXME not sure if we should default this or force to provide a storage...
var storage;
if ((typeof window === "undefined" || !window.localStorage) &&
    !global.localStorage &&
    (typeof localStorage === "undefined" || localStorage === null)) {
    var LocalStorage = require("node-localstorage").LocalStorage;
    storage = new LocalStorage("./localstorage");
}
else {
    storage = localStorage || global.localStorage;
}
var debug = debug_1.default("matrixutil:");
var getSyncMatrixClient = function (_a) {
    if (_a === void 0) { _a = {}; }
    return __awaiter(_this, void 0, void 0, function () {
        var matrixClient, syncFailCount;
        var _b = _a.user, user = _b === void 0 ? process.env.SIFIR_MATRIX_USER : _b, _c = _a.password, password = _c === void 0 ? process.env.SIFIR_MATRIX_PASS : _c, _d = _a.baseUrl, baseUrl = _d === void 0 ? process.env.SIFIR_MATRIX_SERVER : _d, _e = _a.sessionStore, sessionStore = _e === void 0 ? new matrix_js_sdk_1.default.WebStorageSessionStore(storage) : _e, _f = _a.deviceId, deviceId = _f === void 0 ? undefined : _f, _g = _a.acceptVerifiedDevicesOnly, acceptVerifiedDevicesOnly = _g === void 0 ? true : _g, opts = __rest(_a, ["user", "password", "baseUrl", "sessionStore", "deviceId", "acceptVerifiedDevicesOnly"]);
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    debug("Conneting to", baseUrl, user);
                    return [4 /*yield*/, matrix_js_sdk_1.default.createClient(__assign({ baseUrl: baseUrl, initialSyncLimit: 100, timelineSupport: true, sessionStore: sessionStore,
                            deviceId: deviceId }, opts))];
                case 1:
                    matrixClient = _h.sent();
                    return [4 /*yield*/, matrixClient.login("m.login.password", {
                            user: user,
                            password: password,
                            device_id: deviceId
                        })];
                case 2:
                    _h.sent();
                    return [4 /*yield*/, matrixClient.initCrypto()];
                case 3:
                    _h.sent();
                    matrixClient.startClient();
                    if (acceptVerifiedDevicesOnly)
                        matrixClient.setGlobalBlacklistUnverifiedDevices(true);
                    syncFailCount = 0;
                    return [2 /*return*/, new Promise(function (res, rej) {
                            matrixClient.once("sync", function (syncState, a, event) {
                                if (syncState === "ERROR") {
                                    debug("Matrix Sync error", event, syncState, a);
                                    if (event) {
                                        if (!event.error.data) {
                                            debug("event.error.data is missing: ", event.error);
                                        }
                                        if (event.error.data.errcode === "M_UNKNOWN_TOKEN") {
                                            // debug("need to login", true);
                                        }
                                        matrixClient.stop();
                                        rej(event);
                                    }
                                    if (syncFailCount >= 3) {
                                        debug("error", "Could not connect to matrix more than 3 time. Disconnecting.");
                                        rej("Matrix client failed to sync more than " + syncFailCount);
                                    }
                                    else {
                                        debug("error", "Could not connect to matrix server. " + (syncFailCount ? "Attempt " + syncFailCount : ""));
                                        syncFailCount++;
                                    }
                                }
                                else if (syncState === "SYNCING") {
                                    debug("client is in SYNCING state");
                                    syncFailCount = 0;
                                }
                                else if (syncState === "PREPARED") {
                                    debug("client is in PREPARED state");
                                    res(matrixClient);
                                }
                            });
                        })];
            }
        });
    });
};
exports.getSyncMatrixClient = getSyncMatrixClient;
