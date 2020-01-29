import { MatrixClient } from "matrix-js-sdk";
import { EventEmitter } from "events";
import { MatrixEvent } from "matrix-js-sdk";
import express from "express";
interface MatrixBridgeMsgMiddleWare {
  inboundMiddleware(
    req: any
  ): Promise<{ method: string; command: string; param: any; nonce: string }>;
  outboundMiddleware(
    msg: string
  ): Promise<{ deviceId?: string; eventSender?: string; body: any }>;
}
interface MatrixBridgeParam extends MatrixBridgeMsgMiddleWare {
  client: MatrixClient | Promise<MatrixClient>;
  bridge: EventEmitter;
  log: (any: any) => void;
}
interface TransportMsgMiddleWare {
  inboundMiddleware(param: {
    event: MatrixEvent;
    nodeAccountUser: string;
  }): Promise<{ reply: any; nonce: string }>;
  outboundMiddleware(msg: string): Promise<object>;
}
interface MatrixTransportParam extends TransportMsgMiddleWare {
  nodeDeviceId: string;
  nodeAccountUser: string;
  client?: MatrixClient | Promise<MatrixClient>;
  emitter?: EventEmitter;
  msgTimeout?: number;
  maxMsgConcurrency?: number;
  debug: Function;
}
interface AccountDevicesDict {
  [account: string]: string[];
}
type HttpInboundMsgBridgeMiddleware = (
  req: express.Request
) => Promise<{ command: string; method: string; param: any }>;
type HttpOutboundResponseMiddleware = (
  payload: any,
  req: express.Response
) => Promise<express.Response>;
interface SignedHttpBridgeParam {
  log: Function;
  bridge: EventEmitter;
  inboundMiddleware: HttpInboundMsgBridgeMiddleware;
  outboundMiddleware: HttpOutboundResponseMiddleware;
}

export {
  HttpInboundMsgBridgeMiddleware,
  HttpOutboundResponseMiddleware,
  MatrixBridgeMsgMiddleWare,
  MatrixBridgeParam,
  MatrixTransportParam,
  SignedHttpBridgeParam,
  AccountDevicesDict
};
