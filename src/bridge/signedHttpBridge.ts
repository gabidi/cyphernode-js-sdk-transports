import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import express from "express";
import { EventEmitter } from "events";
import _debug from "debug";
import { events } from "../constants";
import bodyParser from "body-parser";
import { SignedHttpBridgeParam } from "../types/interfaces";
const signedHttpBridge = ({
  transport = cypherNodeHttpTransport(),
  log = _debug("sifir:tor-bridge"),
  bridge = new EventEmitter(),
  inboundMiddleware,
  outboundMiddleware
}: SignedHttpBridgeParam): express => {
  /**
   * Starts the bridge and returns the private roomId the user needs to join
   */
  const startBridge = async ({ bridgeApiPort = 3010 } = {}): Promise<void> => {
    const api = express();
    api.use(bodyParser.json());
    //api.use(
    //  cors({
    //    methods: ["GET", "POST", "OPTIONS"],
    //    origin: true,
    //    allowedHeaders: ["Content-Type", "Authorization", "token"],
    //    credentials: true
    //  })
    //);
    // TODO Sync endpoint for phone to poll ?

    const { get, post } = transport;
    api.post(["/:command", "/:command/*"], async (req, res, next) => {
      let reply;
      //let method = req.method;
      //let { command } = req.params;
      //let param = method === "POST" ? req.body : req.params["0"];
      try {
        const { command, method, param } = await inboundMiddleware(req);
        log("got request", method, command, param);
        switch (method) {
          case "GET":
            log("processing get", command);
            reply = await get(command, param);
            break;
          case "POST":
            log("processing post", command);
            reply = await post(command, param);
            break;
          default:
            console.error("Unknown command method", method);
            return;
        }
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
