import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import express from "express";
import uuid from "uuid/v4";
import { EventEmitter } from "events";
import _debug from "debug";
import { events } from "../constants";
import bodyParser from "body-parser";
import cors from "cors";
const cyphernodeTorBridge = ({
  transport = cypherNodeHttpTransport(),
  log = _debug("sifir:tor-bridge"),
  bridge = new EventEmitter(),
  // Inject your authentication Fn here, returns
  // TODO Type this interface
  authMiddleWare = async (payload: {
    method: string;
    command: string;
    param: any;
    req: object;
  }): Promise<boolean> => true
} = {}): any => {
  /**
   * Starts the bridge and returns the private roomId the user needs to join
   */
  const startBridge = async ({ bridgeApiPort = 3010 } = {}): Promise<void> => {
    const api = express();
    api.use(bodyParser.json());
    api.use(
      cors({
        methods: ["GET", "POST", "OPTIONS"],
        origin: true,
        allowedHeaders: ["Content-Type", "Authorization", "token"],
        credentials: true
      })
    );
    // TODO Sync endpoint for phone to poll ?

    const { get, post } = transport;
    api.all(["/:command", "/:command/*"], async (req, res, next) => {
      let reply;
      let method = req.method;
      let { command } = req.params;
      let param = method === "POST" ? req.body : req.params["0"];
      log("got request", method, command, param);
      try {
        if (typeof authMiddleWare == "function") {
          if (!authMiddleWare({ method, command, param, req }) === true) {
            throw "Authentication failed";
          }
        }
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
        res.status(200).json({ ...reply });
      } catch (error) {
        log("Error sending command to transport", error);
        res.status(400).json({ error });
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
export { cyphernodeTorBridge };
