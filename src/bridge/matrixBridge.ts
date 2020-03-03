import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import matrix from "matrix-js-sdk";
import { queue } from "async";
import uuid from "uuid/v4";
import { EventEmitter } from "events";
import _debug from "debug";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events, processingErrors } from "../constants";
import { MatrixBridgeParam, AccountDevicesDict } from "../types/interfaces";
import { commandBroadcaster } from "../lib/commandBroadcaster";

const matrixBridge = ({
  client = getSyncMatrixClient(),
  bridge = new EventEmitter(),
  log = _debug("sifir:matrixbridge"),
  inboundMiddleware,
  outboundMiddleware
}: MatrixBridgeParam): {
  startBridge: Function;
} => {
  if (!inboundMiddleware || !outboundMiddleware) {
    throw "Throw must supply outbound and inbound message processing";
  }
  const { syncEmitCommand } = commandBroadcaster({
    source: "matrixBridge",
    bridge
  });
  const startBridge = async ({
    accountsPairedDeviceList
  }: {
    accountsPairedDeviceList?: AccountDevicesDict;
  } = {}) => {
    log("starting bridge with device account list", accountsPairedDeviceList);
    const _client = client.then ? await client : client;
    _client.on("toDeviceEvent", async event => {
      log("got event", event.getType(), event.getSender());
      if (event.getType() !== events.COMMAND_REQUEST) {
        return;
      }
      let bodyToProcess, content;
      // try to process incoming message
      try {
        content = await inboundMiddleware({
          event,
          accountsPairedDeviceList
        });
        const { method, command, param = null, nonce, ...rest } = content;
        if (!method.length || !command.length || !nonce.length)
          throw processingErrors.INVALID_MSG_PAYLOAD;
        log("got command!", method, command);
        const payload = await syncEmitCommand({
          method,
          command,
          param,
          nonce,
          ...rest
        });
        bodyToProcess = JSON.stringify({ reply: payload, nonce });
      } catch (err) {
        log("Error processing command, attempting to process error", err);
        if (err.message === processingErrors.INVALID_MSG_PAYLOAD) {
          log(
            "[ERROR] FAILED ! Invalid payload recieved, won't attepmt to process"
          );
          return;
        }
        bodyToProcess = JSON.stringify({
          reply: { err },
          nonce: content.nonce
        });
      }
      // process of message done, try sending result to requester
      try {
        const { deviceId, eventSender, body } = await outboundMiddleware(
          bodyToProcess
        );
        log("Bridge sending command reply", body, deviceId, eventSender);
        let reply;
        if (deviceId && eventSender) {
          reply = {
            [eventSender]: {
              [deviceId]: {
                body
              }
            }
          };
        }
        // If middleware does not return the deviceId and Sender, then fallback to provided list
        else {
          reply = Object.entries(accountsPairedDeviceList).reduce(
            (dict, [account, devices]) => {
              log("preparing reply to", account, devices);
              dict[account] = {};
              devices.forEach(device => {
                dict[account][device] = { body };
              });
              return dict;
            },
            <object>{}
          );
        }
        // Send reply
        await _client.sendToDevice(events.COMMAND_REPLY, reply);
      } catch (err) {
        log("[ERROR] could not sendToDevice", err);
      }
      log("finished processing command, and sent reply");
    });
    log("finish starting bridge");
  };
  return {
    startBridge
  };
};
export { matrixBridge };
