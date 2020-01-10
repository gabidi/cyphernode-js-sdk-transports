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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var cyphernode_js_sdk_1 = require("cyphernode-js-sdk");
var express_1 = __importDefault(require("express"));
var events_1 = require("events");
var debug_1 = __importDefault(require("debug"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var cyphernodeTorBridge = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.transport, transport = _c === void 0 ? cyphernode_js_sdk_1.cypherNodeHttpTransport() : _c, _d = _b.log, log = _d === void 0 ? debug_1.default("sifir:bridge") : _d, _e = _b.bridge, bridge = _e === void 0 ? new events_1.EventEmitter() : _e;
    /**
     * Starts the bridge and returns the private roomId the user needs to join
     */
    var startBridge = function () { return __awaiter(_this, void 0, void 0, function () {
        var api, get, post;
        var _this = this;
        return __generator(this, function (_a) {
            api = express_1.default();
            api.use(body_parser_1.default.json());
            api.use(cors_1.default({
                methods: ["GET", "POST", "OPTIONS"],
                origin: true,
                allowedHeaders: ["Content-Type", "Authorization", "token"],
                credentials: true
            }));
            get = transport.get, post = transport.post;
            api.all(["/:command", "/:command/*"], function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                var reply, method, command, param, _a, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            method = req.method;
                            command = req.params.command;
                            param = method === "POST" ? req.body : req.params["0"];
                            log("got request", method, command, param);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 8, , 9]);
                            _a = method;
                            switch (_a) {
                                case "GET": return [3 /*break*/, 2];
                                case "POST": return [3 /*break*/, 4];
                            }
                            return [3 /*break*/, 6];
                        case 2:
                            log("processing get", command);
                            return [4 /*yield*/, get(command, param)];
                        case 3:
                            reply = _b.sent();
                            return [3 /*break*/, 7];
                        case 4:
                            log("processing post", command);
                            return [4 /*yield*/, post(command, param)];
                        case 5:
                            reply = _b.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            console.error("Unknown command method", method);
                            return [2 /*return*/];
                        case 7:
                            res.status(200).json(__assign({}, reply));
                            return [3 /*break*/, 9];
                        case 8:
                            error_1 = _b.sent();
                            log("Error sending command to transport", error_1);
                            res.status(404).json({ error: error_1 });
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            api.listen(3010);
            log("finish starting bridge");
            return [2 /*return*/, api];
        });
    }); };
    // });
    return {
        startBridge: startBridge
    };
};
exports.cyphernodeTorBridge = cyphernodeTorBridge;
