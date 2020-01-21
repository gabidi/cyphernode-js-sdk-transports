import { MatrixClient } from "matrix-js-sdk";
import { EventEmitter } from "events";
interface BridgeMsgMiddleWare {
  inboundMiddleware(
    req: any
  ): Promise<{ method: string; command: string; param: any; nonce: string }>;
  outboundMiddleware(msg: string): Promise<string>;
}
interface MatrixBridgeParam extends BridgeMsgMiddleWare {
  client: MatrixClient | Promise<MatrixClient>;
  // TODO import this sdk repo
  transport: { get: Function; post: Function };
}
interface TransportMsgMiddleWare {
  inboundMiddleware(req: any): Promise<{ reply: any; nonce: string }>;
  outboundMiddleware(msg: string): Promise<string>;
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

export {
  BridgeMsgMiddleWare,
  MatrixBridgeParam,
  MatrixTransportParam,
  AccountDevicesDict
};
