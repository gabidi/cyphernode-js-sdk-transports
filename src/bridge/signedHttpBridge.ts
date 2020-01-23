import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import express from "express";
import { EventEmitter } from "events";
import _debug from "debug";
import { events } from "../constants";
import bodyParser from "body-parser";
import { SignedHttpBridgeParam } from "../types/interfaces";
import { commandBroadcaster } from "../lib/commandBroadcaster";
import uuid from "uuid/v4";
const signedHttpBridge = ({
  transport = cypherNodeHttpTransport(),
  log = _debug("sifir:tor-bridge"),
  bridge = new EventEmitter(),
  inboundMiddleware,
  outboundMiddleware
}: SignedHttpBridgeParam): express => {
  const { syncEmitCommand } = commandBroadcaster({ bridge });
  const startBridge = async ({ bridgeApiPort = 3010 } = {}): Promise<void> => {
    const api = express();
    api.use(bodyParser.json());
    const { get, post } = transport;
    api.all(["/:command", "/:command/*"], async (req, res, next) => {
      let reply;
      try {
        const { command, method, param } = await inboundMiddleware(req);
        log("got request", method, command, param);
        let nonce = uuid();
        const reply = await syncEmitCommand({
          command,
          method,
          param,
          nonce
        });
        //switch (method) {
        //  case "GET":
        //    log("processing get", command);
        //    reply = await get(command, param);
        //    break;
        //  case "POST":
        //    log("processing post", command);
        //    reply = await post(command, param);
        //    break;
        //  default:
        //    console.error("Unknown command method", method);
        //    return;
        //}
        (await outboundMiddleware(reply, res)).status(200).json({ ...reply });
      } catch (err) {
        log("Error sending command to transport", err);
        (await outboundMiddleware(err, res)).status(400).json({ err });
      }
    });
    api.listen(bridgeApiPort);
    log("finish starting bridge");
    return api;
  };
  // });
  return {
    startBridge
  };
};
export { signedHttpBridge, SignedHttpBridgeParam };
