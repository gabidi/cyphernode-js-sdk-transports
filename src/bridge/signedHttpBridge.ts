import express from "express";
import { EventEmitter } from "events";
import _debug from "debug";
import { events } from "../constants";
import bodyParser from "body-parser";
import { SignedHttpBridgeParam } from "../types/interfaces";
import { commandBroadcaster } from "../lib/commandBroadcaster";
import uuid from "uuid/v4";
const signedHttpBridge = ({
  log = _debug("sifir:signedHttpbridge"),
  bridge = new EventEmitter(),
  inboundMiddleware,
  outboundMiddleware
}: SignedHttpBridgeParam): express => {
  const { syncEmitCommand } = commandBroadcaster({
    source: "signedHttpBridge",
    bridge
  });
  const startBridge = async ({ bridgeApiPort = 3010 } = {}): Promise<void> => {
    const api = express();
    api.use(bodyParser.json());
    api.all(["/:command", "/:command/*"], async (req, res, next) => {
      let reply;
      try {
        const { command, method, param, ...rest } = await inboundMiddleware(
          req
        );
        log("got request", method, command, param, rest);
        let nonce = uuid();
        const reply = await syncEmitCommand({
          command,
          method,
          param,
          nonce,
          ...rest
        });
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
