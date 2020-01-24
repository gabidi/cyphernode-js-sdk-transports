export { matrixBridge } from "./src/bridge/matrixBridge";
export { signedHttpBridge } from "./src/bridge/signedHttpBridge";
export {
  getSyncMatrixClient,
  MatrixClient,
  MatrixEvent
} from "./src/lib/matrixUtil";

export {
  HttpInboundMsgBridgeMiddleware,
  HttpOutboundResponseMiddleware,
  MatrixBridgeMsgMiddleWare,
  MatrixBridgeParam,
  MatrixTransportParam,
  SignedHttpBridgeParam,
  AccountDevicesDict
} from "./src/types/interfaces";
export {
  cypherNodeMatrixTransport
} from "./src/transports/cyphernodeMatrixTransport";
